package com.mytelmed.core.payment.service;

import com.mytelmed.common.advice.AppException;
import com.mytelmed.common.constant.appointment.AppointmentStatus;
import com.mytelmed.common.constant.delivery.DeliveryStatus;
import com.mytelmed.common.constant.payment.BillingStatus;
import com.mytelmed.common.constant.prescription.PrescriptionStatus;
import com.mytelmed.common.event.payment.model.PaymentCompletedEvent;
import com.mytelmed.common.event.payment.model.RefundCompletedEvent;
import com.mytelmed.core.appointment.entity.Appointment;
import com.mytelmed.core.appointment.repository.AppointmentRepository;
import com.mytelmed.core.appointment.service.AppointmentStateMachine;
import com.mytelmed.core.delivery.entity.MedicationDelivery;
import com.mytelmed.core.delivery.repository.MedicationDeliveryRepository;
import com.mytelmed.core.payment.entity.Bill;
import com.mytelmed.core.payment.entity.PaymentTransaction;
import com.mytelmed.core.payment.repository.BillRepository;
import com.mytelmed.core.payment.repository.PaymentTransactionRepository;
import com.stripe.model.Charge;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Refund;
import com.stripe.model.StripeObject;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Optional;

/**
 * Service for processing Stripe webhook events.
 * Handles automatic payment confirmations and status updates.
 */
@Slf4j
@Service
public class PaymentWebhookService {
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final BillRepository billRepository;
    private final AppointmentRepository appointmentRepository;
    private final MedicationDeliveryRepository deliveryRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final AppointmentStateMachine appointmentStateMachine;

    public PaymentWebhookService(PaymentTransactionRepository paymentTransactionRepository,
            BillRepository billRepository,
            AppointmentRepository appointmentRepository,
            MedicationDeliveryRepository deliveryRepository,
            ApplicationEventPublisher eventPublisher,
            AppointmentStateMachine appointmentStateMachine) {
        this.paymentTransactionRepository = paymentTransactionRepository;
        this.billRepository = billRepository;
        this.appointmentRepository = appointmentRepository;
        this.deliveryRepository = deliveryRepository;
        this.eventPublisher = eventPublisher;
        this.appointmentStateMachine = appointmentStateMachine;
    }

    /**
     * Processes incoming webhook events from Stripe
     */
    @Transactional
    public void processWebhookEvent(Event event) throws AppException {
        log.info("Processing webhook event: {} with ID: {}", event.getType(), event.getId());

        switch (event.getType()) {
            case "charge.succeeded" -> handleChargeSucceeded(event);
            case "payment_intent.payment_failed" -> handlePaymentFailed(event);
            case "payment_intent.canceled" -> handlePaymentCanceled(event);
            case "payment_intent.requires_action" -> handlePaymentRequiresAction(event);
            case "refund.created" -> handleRefundCreated(event);
            default -> log.info("Unhandled webhook event type: {}", event.getType());
        }
    }

    /**
     * Handles successful charge events from Stripe
     */
    private void handleChargeSucceeded(Event event) throws AppException {
        Charge charge = extractCharge(event);
        String chargeId = charge.getId();
        String paymentIntentId = charge.getPaymentIntent();

        log.info("Processing successful Stripe charge: {}", chargeId);

        // Try finding transaction by charge ID
        Optional<PaymentTransaction> transactionOpt = paymentTransactionRepository.findByStripeChargeId(chargeId);

        if (transactionOpt.isEmpty()) {
            log.warn("No transaction found for Charge ID: {}. Trying Payment Intent ID: {}", chargeId, paymentIntentId);
            transactionOpt = paymentTransactionRepository.findByStripePaymentIntentId(paymentIntentId);
        }

        if (transactionOpt.isEmpty()) {
            log.error("Failed to locate PaymentTransaction for Charge ID: {} or Payment Intent ID: {}", chargeId, paymentIntentId);
            throw new AppException("Payment transaction not found for Stripe charge event");
        }

        PaymentTransaction transaction = transactionOpt.get();

        // Update the transaction status
        updateTransactionStatusFromCharge(transaction, PaymentTransaction.TransactionStatus.COMPLETED, charge);

        // Update the associated bill status
        updateBillStatusFromCharge(transaction.getBill(), BillingStatus.PAID, charge);

        // Handle additional post-payment side effects
        processSuccessfulPaymentSideEffects(transaction.getBill());

        // Publish payment completed event (for receipt email, etc.)
        String receiptUrl = charge.getReceiptUrl();
        PaymentCompletedEvent paymentEvent = PaymentCompletedEvent.builder()
                .bill(transaction.getBill())
                .transaction(transaction)
                .receiptUrl(receiptUrl)
                .build();

        eventPublisher.publishEvent(paymentEvent);

        log.info("Successfully processed payment for Transaction #: {} | Receipt URL: {}",
                transaction.getTransactionNumber(), receiptUrl);
    }

    /**
     * Handles failed payment events
     */
    private void handlePaymentFailed(Event event) throws AppException {
        PaymentIntent paymentIntent = extractPaymentIntent(event);
        log.info("Processing failed payment for PaymentIntent: {}", paymentIntent.getId());

        Optional<PaymentTransaction> transactionOpt = paymentTransactionRepository
                .findByStripePaymentIntentId(paymentIntent.getId());

        if (transactionOpt.isEmpty()) {
            log.warn("Payment transaction not found for PaymentIntent: {}", paymentIntent.getId());
            return;
        }

        PaymentTransaction transaction = transactionOpt.get();

        // Update transaction status
        transaction.setStatus(PaymentTransaction.TransactionStatus.FAILED);
        transaction
                .setFailureReason(
                        paymentIntent.getLastPaymentError() != null ? paymentIntent.getLastPaymentError().getMessage()
                                : "Payment failed");
        paymentTransactionRepository.save(transaction);

        log.info("Marked payment as failed for transaction: {}", transaction.getTransactionNumber());
    }

    /**
     * Handles canceled payment events
     */
    private void handlePaymentCanceled(Event event) throws AppException {
        PaymentIntent paymentIntent = extractPaymentIntent(event);
        log.info("Processing canceled payment for PaymentIntent: {}", paymentIntent.getId());

        Optional<PaymentTransaction> transactionOpt = paymentTransactionRepository
                .findByStripePaymentIntentId(paymentIntent.getId());

        if (transactionOpt.isEmpty()) {
            log.warn("Payment transaction not found for PaymentIntent: {}", paymentIntent.getId());
            return;
        }

        PaymentTransaction transaction = transactionOpt.get();

        // Update transaction status
        transaction.setStatus(PaymentTransaction.TransactionStatus.CANCELLED);
        paymentTransactionRepository.save(transaction);

        log.info("Marked payment as canceled for transaction: {}", transaction.getTransactionNumber());
    }

    /**
     * Handles payment events that require additional action (e.g., 3D Secure)
     */
    private void handlePaymentRequiresAction(Event event) throws AppException {
        PaymentIntent paymentIntent = extractPaymentIntent(event);
        log.info("Processing payment requiring action for PaymentIntent: {}", paymentIntent.getId());

        Optional<PaymentTransaction> transactionOpt = paymentTransactionRepository
                .findByStripePaymentIntentId(paymentIntent.getId());

        if (transactionOpt.isEmpty()) {
            log.warn("Payment transaction not found for PaymentIntent: {}", paymentIntent.getId());
            return;
        }

        PaymentTransaction transaction = transactionOpt.get();

        // Update transaction status
        transaction.setStatus(PaymentTransaction.TransactionStatus.PENDING);
        paymentTransactionRepository.save(transaction);

        log.info("Marked payment as pending action for transaction: {}", transaction.getTransactionNumber());
    }

    /**
     * Handles successful refund events from Stripe
     */
    private void handleRefundCreated(Event event) throws AppException {
        Refund refund = extractRefund(event);
        log.info("Processing successful refund for Refund: {}", refund.getId());

        // Find the transaction by charge ID
        Optional<PaymentTransaction> transactionOpt = paymentTransactionRepository
                .findByStripeChargeId(refund.getCharge());

        if (transactionOpt.isEmpty()) {
            log.warn("Payment transaction not found for charge: {}", refund.getCharge());
            return;
        }

        PaymentTransaction transaction = transactionOpt.get();

        // Update transaction status
        updateTransactionForRefund(transaction, refund);

        // Update bill status
        updateBillForRefund(transaction.getBill(), refund);

        // Publish refund completed event for notifications
        publishRefundCompletedEvent(transaction.getBill(), transaction, refund);

        log.info("Successfully processed refund for transaction: {} with refund ID: {}",
                transaction.getTransactionNumber(), refund.getId());
    }

    /**
     * Extracts PaymentIntent from webhook event
     */
    private PaymentIntent extractPaymentIntent(Event event) throws AppException {
        StripeObject stripeObject = event.getDataObjectDeserializer().getObject().orElse(null);

        if (!(stripeObject instanceof PaymentIntent)) {
            throw new AppException("Invalid webhook event data - expected PaymentIntent");
        }

        return (PaymentIntent) stripeObject;
    }

    /**
     * Extracts Refund from webhook event
     */
    private Refund extractRefund(Event event) throws AppException {
        StripeObject stripeObject = event.getDataObjectDeserializer().getObject().orElse(null);

        log.debug("Stripe refund object: {}", stripeObject);

        if (!(stripeObject instanceof Refund)) {
            throw new AppException("Invalid webhook event data - expected Refund");
        }

        return (Refund) stripeObject;
    }

    /**
     * Extracts Charge from webhook event
     */
    private Charge extractCharge(Event event) throws AppException {
        StripeObject stripeObject = event.getDataObjectDeserializer().getObject().orElse(null);

        if (!(stripeObject instanceof Charge)) {
            throw new AppException("Invalid webhook event data - expected Charge");
        }

        return (Charge) stripeObject;
    }

    /**
     * Updates transaction status and related fields from a Charge object
     */
    private void updateTransactionStatusFromCharge(PaymentTransaction transaction,
            PaymentTransaction.TransactionStatus status,
            Charge charge) {
        transaction.setStatus(status);
        transaction.setStripeChargeId(charge.getId());
        transaction.setProcessedAt(Instant.now());
        paymentTransactionRepository.save(transaction);
    }

    /**
     * Updates bill status and related fields from a Charge object
     */
    private void updateBillStatusFromCharge(Bill bill, BillingStatus status, Charge charge) {
        bill.setBillingStatus(status);
        bill.setStripePaymentIntentId(charge.getPaymentIntent());
        bill.setStripeChargeId(charge.getId());
        bill.setReceiptUrl(charge.getReceiptUrl()); // Store encrypted receipt URL
        bill.setPaidAt(Instant.now());
        billRepository.save(bill);
    }

    /**
     * Processes side effects of successful payments (update
     * appointments/deliveries)
     */
    private void processSuccessfulPaymentSideEffects(Bill bill) {
        // Handle appointment payments
        if (bill.getAppointment() != null) {
            processAppointmentPaymentSuccess(bill.getAppointment());
        }

        // Handle prescription/delivery payments
        if (bill.getPrescription() != null) {
            processPrescriptionPaymentSuccess(bill.getPrescription().getId());
        }
    }

    /**
     * Updates appointment status after successful payment
     */
    private void processAppointmentPaymentSuccess(Appointment appointment) {
        log.info("Processing appointment payment success for appointment: {}", appointment.getId());

        // Update appointment status from PENDING_PAYMENT to PENDING (for both virtual
        // and physical)
        if (appointment.getStatus() == AppointmentStatus.PENDING_PAYMENT) {
            try {
                // Use state machine to validate transition
                appointmentStateMachine.validateTransition(
                        appointment.getStatus(),
                        AppointmentStatus.PENDING,
                        appointment.getConsultationMode());

                appointment.setStatus(AppointmentStatus.PENDING);
                appointmentRepository.save(appointment);

                log.info(
                        "Updated appointment {} status to PENDING after payment confirmation (PENDING_PAYMENT → PENDING)",
                        appointment.getId());
            } catch (Exception e) {
                log.error("Failed to update appointment status after payment: {}", appointment.getId(), e);
            }
        }
    }

    /**
     * Updates delivery status after successful payment
     */
    private void processPrescriptionPaymentSuccess(java.util.UUID prescriptionId) {
        log.info("Processing prescription payment success for prescription: {}", prescriptionId);

        // Find the latest non-cancelled delivery for this prescription (OneToMany
        // relationship)
        Optional<MedicationDelivery> deliveryOpt = deliveryRepository
                .findLatestNonCancelledByPrescriptionId(prescriptionId);

        if (deliveryOpt.isPresent()) {
            MedicationDelivery delivery = deliveryOpt.get();

            // Update delivery status from PENDING_PAYMENT to PAID
            if (delivery.getStatus() == DeliveryStatus.PENDING_PAYMENT) {
                delivery.setStatus(DeliveryStatus.PAID);

                delivery.getPrescription().setStatus(PrescriptionStatus.READY_FOR_PROCESSING);
                deliveryRepository.save(delivery);

                log.info("Updated delivery {} status to PAID after payment confirmation", delivery.getId());
            }
        } else {
            log.warn("No active delivery found for prescription {} during payment processing", prescriptionId);
        }
    }

    /**
     * Updates transaction status for refund
     */
    private void updateTransactionForRefund(PaymentTransaction transaction, Refund refund) {
        transaction.setStatus(PaymentTransaction.TransactionStatus.REFUNDED);
        transaction.setRefundAmount(BigDecimal.valueOf(refund.getAmount() / 100.0));
        transaction.setStripeRefundId(refund.getId());
        transaction.setRefundedAt(Instant.now());
        transaction.setRefundReason(refund.getReason());
        paymentTransactionRepository.save(transaction);
    }

    /**
     * Updates bill status for refund
     */
    private void updateBillForRefund(Bill bill, Refund refund) {
        bill.setBillingStatus(BillingStatus.REFUNDED); // Update main billing status
        bill.setRefundStatus(Bill.RefundStatus.REFUNDED);
        bill.setRefundAmount(BigDecimal.valueOf(refund.getAmount() / 100.0));
        bill.setStripeRefundId(refund.getId());
        bill.setRefundedAt(Instant.now());
        bill.setRefundReason(refund.getReason());
        billRepository.save(bill);
    }

    /**
     * Publishes refund completed event for notifications
     */
    private void publishRefundCompletedEvent(Bill bill, PaymentTransaction transaction, Refund refund) {
        try {
            RefundCompletedEvent event = RefundCompletedEvent.builder()
                    .bill(bill)
                    .transaction(transaction)
                    .stripeRefundId(refund.getId())
                    .refundAmount(BigDecimal.valueOf(refund.getAmount() / 100.0))
                    .refundReason(refund.getReason())
                    .build();

            eventPublisher.publishEvent(event);
            log.info("Published RefundCompletedEvent for bill: {} via webhook", bill.getId());
        } catch (Exception e) {
            log.error("Failed to publish RefundCompletedEvent for bill: {} via webhook", bill.getId(), e);
        }
    }
}
