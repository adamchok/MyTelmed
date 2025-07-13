package com.mytelmed.core.payment.service;

import com.mytelmed.common.advice.AppException;
import com.mytelmed.common.advice.exception.ResourceNotFoundException;
import com.mytelmed.common.constant.appointment.ConsultationMode;
import com.mytelmed.common.constant.family.FamilyPermissionType;
import com.mytelmed.common.constant.payment.BillType;
import com.mytelmed.common.constant.payment.BillingStatus;
import com.mytelmed.common.constant.payment.PaymentMode;
import com.mytelmed.common.event.payment.model.BillGeneratedEvent;
import com.mytelmed.common.event.payment.model.PaymentCompletedEvent;
import com.mytelmed.core.appointment.entity.Appointment;
import com.mytelmed.core.appointment.service.AppointmentService;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.family.service.FamilyMemberPermissionService;
import com.mytelmed.core.patient.entity.Patient;
import com.mytelmed.core.patient.service.PatientService;
import com.mytelmed.core.payment.dto.PaymentIntentResponseDto;
import com.mytelmed.core.payment.entity.Bill;
import com.mytelmed.core.payment.entity.PaymentTransaction;
import com.mytelmed.core.payment.repository.BillRepository;
import com.mytelmed.core.payment.repository.PaymentTransactionRepository;
import com.mytelmed.core.prescription.entity.Prescription;
import com.mytelmed.core.prescription.service.PrescriptionService;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentConfirmParams;
import com.stripe.param.PaymentIntentCreateParams;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;


@Slf4j
@Service
public class PaymentService {
    private final BillRepository billRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final PatientService patientService;
    private final AppointmentService appointmentService;
    private final PrescriptionService prescriptionService;
    private final FamilyMemberPermissionService familyPermissionService;
    private final ApplicationEventPublisher eventPublisher;

    @Value("${stripe.secret.key:}")
    private String stripeSecretKey;

    @Value("${mytelmed.appointment.consultation.fee}")
    private BigDecimal consultationFee;

    @Value("${mytelmed.prescription.delivery.fee}")
    private BigDecimal deliveryFee;

    public PaymentService(BillRepository billRepository,
                          PaymentTransactionRepository paymentTransactionRepository,
                          PatientService patientService,
                          AppointmentService appointmentService,
                          PrescriptionService prescriptionService,
                          FamilyMemberPermissionService familyPermissionService,
                          ApplicationEventPublisher eventPublisher) {
        this.billRepository = billRepository;
        this.paymentTransactionRepository = paymentTransactionRepository;
        this.patientService = patientService;
        this.appointmentService = appointmentService;
        this.prescriptionService = prescriptionService;
        this.familyPermissionService = familyPermissionService;
        this.eventPublisher = eventPublisher;
    }

    /**
     * Checks if payment is required for an appointment based on consultation mode.
     * Only VIRTUAL consultations require upfront payment.
     */
    @Transactional(readOnly = true)
    public boolean isPaymentRequired(UUID appointmentId) throws AppException {
        Appointment appointment = appointmentService.findById(appointmentId);
        return appointment.getConsultationMode() == ConsultationMode.VIRTUAL;
    }

    @Transactional
    public PaymentIntentResponseDto createAppointmentPaymentIntent(Account account, UUID appointmentId)
            throws AppException {
        log.info("Creating payment intent for appointment: {} by account: {}", appointmentId, account.getId());

        Appointment appointment = appointmentService.findById(appointmentId);

        // Check if payment is required for this consultation mode
        if (!isPaymentRequired(appointmentId)) {
            throw new AppException(
                    "Payment is not required for " + appointment.getConsultationMode() + " consultations");
        }

        // Get all patient IDs this account is authorized to access
        List<UUID> authorizedPatientIds = familyPermissionService.getAuthorizedPatientIds(account);
        if (authorizedPatientIds.isEmpty()) {
            throw new AppException("Account is not authorized to make payments for any patient");
        }

        // Verify the appointment belongs to one of the authorized patients
        UUID appointmentPatientId = appointment.getPatient().getId();
        if (!authorizedPatientIds.contains(appointmentPatientId)) {
            throw new AppException("Not authorized to pay for this appointment");
        }

        // Verify the account has BOOK_APPOINTMENT permission for this specific patient
        if (!familyPermissionService.hasPermission(account, appointmentPatientId,
                FamilyPermissionType.MANAGE_BILLING)) {
            throw new AppException("Insufficient permissions to make payment for appointments");
        }

        try {
            Patient patient = appointment.getPatient();
            Bill bill;

            // Check if bill already exists
            Optional<Bill> existingBill = billRepository.findByAppointmentId(appointmentId);
            if (existingBill.isPresent()) {
                bill = existingBill.get();
                
                // If bill is already paid, prevent duplicate payment
                if (bill.getBillingStatus() == BillingStatus.PAID) {
                    throw new AppException("Payment for this appointment has already been completed");
                }
                
                // If bill is unpaid, we can reuse it for retry
                log.info("Reusing existing unpaid bill {} for appointment {} retry", bill.getBillNumber(), appointmentId);
            } else {
                // Create new bill
                bill = createBill(patient, BillType.CONSULTATION, consultationFee,
                        "Virtual consultation fee for appointment with Dr. " + appointment.getDoctor().getName(),
                        appointment, null);
                log.info("Created new bill {} for appointment {}", bill.getBillNumber(), appointmentId);
            }

            // Always create a new Stripe PaymentIntent for each attempt
            PaymentIntent paymentIntent = createStripePaymentIntent(bill);

            return new PaymentIntentResponseDto(
                    paymentIntent.getId(),
                    paymentIntent.getClientSecret(),
                    bill.getAmount(),
                    paymentIntent.getCurrency().toUpperCase(),
                    paymentIntent.getStatus(),
                    bill.getId().toString(),
                    bill.getDescription());
        } catch (StripeException e) {
            log.error("Stripe error creating payment intent for appointment: {}", appointmentId, e);
            throw new AppException("Failed to create payment intent: " + e.getMessage());
        }
    }

    @Transactional
    public PaymentIntentResponseDto createPrescriptionPaymentIntent(Account account, UUID prescriptionId)
            throws AppException {
        log.info("Creating payment intent for prescription: {} by account: {}", prescriptionId, account.getId());

        Prescription prescription = prescriptionService.findById(prescriptionId);

        // Get all patient IDs this account is authorized to access
        List<UUID> authorizedPatientIds = familyPermissionService.getAuthorizedPatientIds(account);
        if (authorizedPatientIds.isEmpty()) {
            throw new AppException("Account is not authorized to make payments for any patient");
        }

        // Verify the prescription belongs to one of the authorized patients
        UUID prescriptionPatientId = prescription.getPatient().getId();
        if (!authorizedPatientIds.contains(prescriptionPatientId)) {
            throw new AppException("Not authorized to pay for this prescription");
        }

        // Verify the account has BOOK_APPOINTMENT permission for this specific patient (required for payment)
        if (!familyPermissionService.hasPermission(account, prescriptionPatientId,
                FamilyPermissionType.MANAGE_BILLING)) {
            throw new AppException("Insufficient permissions to make payment for prescriptions");
        }

        try {
            Patient patient = prescription.getPatient();
            Bill bill;

            // Check if bill already exists
            Optional<Bill> existingBill = billRepository.findByPrescriptionId(prescriptionId);
            if (existingBill.isPresent()) {
                bill = existingBill.get();
                
                // If bill is already paid, prevent duplicate payment
                if (bill.getBillingStatus() == BillingStatus.PAID) {
                    throw new AppException("Payment for this prescription has already been completed");
                }
                
                // If bill is unpaid, we can reuse it for retry
                log.info("Reusing existing unpaid bill {} for prescription {} retry", bill.getBillNumber(), prescriptionId);
            } else {
                // Create new bill for standardized delivery fee (RM 10)
                bill = createBill(patient, BillType.MEDICATION, deliveryFee,
                        "Medication delivery fee for prescription: " + prescription.getId(),
                        null, prescription);
                log.info("Created new bill {} for prescription {}", bill.getBillNumber(), prescriptionId);
            }

            // Always create a new Stripe PaymentIntent for each attempt
            PaymentIntent paymentIntent = createStripePaymentIntent(bill);

            return new PaymentIntentResponseDto(
                    paymentIntent.getId(),
                    paymentIntent.getClientSecret(),
                    bill.getAmount(),
                    paymentIntent.getCurrency().toUpperCase(),
                    paymentIntent.getStatus(),
                    bill.getId().toString(),
                    bill.getDescription());
        } catch (StripeException e) {
            log.error("Stripe error creating payment intent for prescription: {}", prescriptionId, e);
            throw new AppException("Failed to create payment intent: " + e.getMessage());
        }
    }

    @Transactional
    public PaymentIntentResponseDto confirmPayment(Account account, String paymentIntentId, String paymentMethodId)
            throws AppException {
        log.info("Confirming payment intent: {} by account: {}", paymentIntentId, account.getId());

        try {
            // Find the payment transaction
            PaymentTransaction transaction = paymentTransactionRepository.findByStripePaymentIntentId(paymentIntentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Payment transaction not found"));

            // Get all patient IDs this account is authorized to access
            List<UUID> authorizedPatientIds = familyPermissionService.getAuthorizedPatientIds(account);
            if (authorizedPatientIds.isEmpty()) {
                throw new AppException("Account is not authorized to confirm payments for any patient");
            }

            // Verify the transaction belongs to one of the authorized patients
            UUID transactionPatientId = transaction.getPatient().getId();
            if (!authorizedPatientIds.contains(transactionPatientId)) {
                throw new AppException("Not authorized to confirm this payment");
            }

            // Confirm payment with Stripe
            PaymentIntent paymentIntent = confirmStripePayment(paymentIntentId, paymentMethodId);

            // Update transaction
            transaction.setStatus(PaymentTransaction.TransactionStatus.PROCESSING);
            transaction.setStripePaymentMethodId(paymentMethodId);
            paymentTransactionRepository.save(transaction);

            // Process payment based on status
            if ("succeeded".equals(paymentIntent.getStatus())) {
                processSuccessfulPayment(transaction, paymentIntent);
            } else if ("requires_action".equals(paymentIntent.getStatus())) {
                // Handle 3D Secure or other authentication
                transaction.setStatus(PaymentTransaction.TransactionStatus.PENDING);
                paymentTransactionRepository.save(transaction);
            }

            return new PaymentIntentResponseDto(
                    paymentIntent.getId(),
                    paymentIntent.getClientSecret(),
                    transaction.getAmount(),
                    paymentIntent.getCurrency().toUpperCase(),
                    paymentIntent.getStatus(),
                    transaction.getBill().getId().toString(),
                    transaction.getBill().getDescription());
        } catch (StripeException e) {
            log.error("Stripe error confirming payment: {}", paymentIntentId, e);
            throw new AppException("Failed to confirm payment: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public Page<Bill> getPatientBills(Account account, Pageable pageable) {
        // Get all patient IDs this account is authorized to access
        List<UUID> authorizedPatientIds = familyPermissionService.getAuthorizedPatientIds(account);
        if (authorizedPatientIds.isEmpty()) {
            throw new AppException("Account is not authorized to view bills for any patient");
        }

        // Get bills for all authorized patients
        List<Bill> allBills = new ArrayList<>();
        for (UUID patientId : authorizedPatientIds) {
            Page<Bill> patientBills = billRepository.findByPatientId(patientId, Pageable.unpaged());
            allBills.addAll(patientBills.getContent());
        }

        // Sort bills by creation date (most recent first)
        allBills.sort((b1, b2) -> b2.getBilledAt().compareTo(b1.getBilledAt()));

        // Apply pagination manually
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), allBills.size());
        List<Bill> paginatedBills = start < allBills.size() ? allBills.subList(start, end) : new ArrayList<>();

        return new PageImpl<>(paginatedBills, pageable, allBills.size());
    }

    @Transactional(readOnly = true)
    public Page<PaymentTransaction> getPatientTransactions(Account account, Pageable pageable) {
        // Get all patient IDs this account is authorized to access
        List<UUID> authorizedPatientIds = familyPermissionService.getAuthorizedPatientIds(account);
        if (authorizedPatientIds.isEmpty()) {
            throw new AppException("Account is not authorized to view transactions for any patient");
        }

        // Get transactions for all authorized patients
        List<PaymentTransaction> allTransactions = new ArrayList<>();
        for (UUID patientId : authorizedPatientIds) {
            Page<PaymentTransaction> patientTransactions = paymentTransactionRepository.findByPatientId(patientId, Pageable.unpaged());
            allTransactions.addAll(patientTransactions.getContent());
        }

        // Sort transactions by creation date (most recent first)
        allTransactions.sort((t1, t2) -> t2.getCreatedAt().compareTo(t1.getCreatedAt()));

        // Apply pagination manually
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), allTransactions.size());
        List<PaymentTransaction> paginatedTransactions = start < allTransactions.size() ?
                allTransactions.subList(start, end) : new ArrayList<>();

        return new PageImpl<>(paginatedTransactions, pageable, allTransactions.size());
    }

    private Bill createBill(Patient patient, BillType billType, BigDecimal amount,
                            String description, Appointment appointment, Prescription prescription) {
        String billNumber = generateBillNumber(billType);

        Bill bill = Bill.builder()
                .billNumber(billNumber)
                .amount(amount)
                .patient(patient)
                .billType(billType)
                .billingStatus(BillingStatus.UNPAID)
                .appointment(appointment)
                .prescription(prescription)
                .description(description)
                .billedAt(Instant.now())
                .build();

        Bill savedBill = billRepository.save(bill);

        // Publish bill generated event for invoice email
        BillGeneratedEvent billEvent = BillGeneratedEvent.builder()
                .bill(savedBill)
                .build();
        eventPublisher.publishEvent(billEvent);

        log.info("Published bill generated event for bill: {}", savedBill.getBillNumber());

        return savedBill;
    }

    private PaymentIntent createStripePaymentIntent(Bill bill) throws StripeException {
        // Set Stripe API key
        com.stripe.Stripe.apiKey = stripeSecretKey;

        Map<String, String> metadata = new HashMap<>();
        metadata.put("bill_id", bill.getId().toString());
        metadata.put("bill_number", bill.getBillNumber());
        metadata.put("patient_id", bill.getPatient().getId().toString());

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount((long) (bill.getAmount().doubleValue() * 100)) // Convert to cents
                .setCurrency("myr")
                .putAllMetadata(metadata)
                .setDescription(bill.getDescription())
                .setAutomaticPaymentMethods(
                        PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                .setEnabled(true)
                                .setAllowRedirects(PaymentIntentCreateParams.AutomaticPaymentMethods.AllowRedirects.NEVER)
                                .build())
                .build();

        PaymentIntent paymentIntent = PaymentIntent.create(params);

        // Create transaction record with correct currency
        String transactionNumber = generateTransactionNumber();
        PaymentTransaction transaction = PaymentTransaction.builder()
                .transactionNumber(transactionNumber)
                .bill(bill)
                .patient(bill.getPatient())
                .amount(bill.getAmount())
                .paymentMode(PaymentMode.CARD)
                .status(PaymentTransaction.TransactionStatus.PENDING)
                .stripePaymentIntentId(paymentIntent.getId())
                .currency("MYR")
                .build();

        paymentTransactionRepository.save(transaction);

        return paymentIntent;
    }

    private PaymentIntent confirmStripePayment(String paymentIntentId, String paymentMethodId) throws StripeException {
        com.stripe.Stripe.apiKey = stripeSecretKey;

        PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);

        PaymentIntentConfirmParams params = PaymentIntentConfirmParams.builder()
                .setPaymentMethod(paymentMethodId)
                .build();

        return paymentIntent.confirm(params);
    }

    private void processSuccessfulPayment(PaymentTransaction transaction, PaymentIntent paymentIntent) {
        // Update transaction
        transaction.setStatus(PaymentTransaction.TransactionStatus.COMPLETED);
        transaction.setStripeChargeId(paymentIntent.getLatestCharge());
        transaction.setProcessedAt(Instant.now());
        paymentTransactionRepository.save(transaction);

        // Update bill
        Bill bill = transaction.getBill();
        bill.setBillingStatus(BillingStatus.PAID);
        bill.setPaymentMode(PaymentMode.CARD);
        bill.setStripePaymentIntentId(paymentIntent.getId());
        bill.setStripeChargeId(paymentIntent.getLatestCharge());
        bill.setPaidAt(Instant.now());
        billRepository.save(bill);

        // Publish payment completed event for receipt email
        PaymentCompletedEvent paymentEvent = PaymentCompletedEvent.builder()
                .bill(bill)
                .transaction(transaction)
                .build();
        eventPublisher.publishEvent(paymentEvent);

        log.info("Payment completed successfully for bill: {} with transaction: {}",
                bill.getBillNumber(), transaction.getTransactionNumber());
    }

    private String generateBillNumber(BillType billType) {
        String prefix = billType == BillType.CONSULTATION ? "CON" : "MED";
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        return prefix + "-" + timestamp + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private String generateTransactionNumber() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        return "TXN-" + timestamp + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}