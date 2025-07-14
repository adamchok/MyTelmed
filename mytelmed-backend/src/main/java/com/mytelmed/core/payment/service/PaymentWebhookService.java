package com.mytelmed.core.payment.service;

import com.mytelmed.common.advice.AppException;
import com.mytelmed.common.constant.appointment.AppointmentStatus;
import com.mytelmed.common.constant.delivery.DeliveryStatus;
import com.mytelmed.common.constant.payment.BillingStatus;
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
            case "payment_intent.succeeded" -> handlePaymentSucceeded(event);
            case "payment_intent.payment_failed" -> handlePaymentFailed(event);
            case "payment_intent.canceled" -> handlePaymentCanceled(event);
            case "payment_intent.requires_action" -> handlePaymentRequiresAction(event);
            case "refund.created" -> handleRefundCreated(event);
            default -> log.info("Unhandled webhook event type: {}", event.getType());
        }
    }

    /**
     * Handles successful payment events
     */
    private void handlePaymentSucceeded(Event event) throws AppException {
        PaymentIntent paymentIntent = extractPaymentIntent(event);
        log.info("Processing successful payment for PaymentIntent: {}", paymentIntent.getId());

        Optional<PaymentTransaction> transactionOpt = paymentTransactionRepository
                .findByStripePaymentIntentId(paymentIntent.getId());

        if (transactionOpt.isEmpty()) {
            log.warn("Payment transaction not found for PaymentIntent: {}", paymentIntent.getId());
            return;
        }

        PaymentTransaction transaction = transactionOpt.get();

        // Update transaction status
        updateTransactionStatus(transaction, PaymentTransaction.TransactionStatus.COMPLETED, paymentIntent);

        // Update bill status
        updateBillStatus(transaction.getBill(), BillingStatus.PAID, paymentIntent);

        // Update related entities (appointment or delivery)
        processSuccessfulPaymentSideEffects(transaction.getBill());

        // Publish payment completed event for receipt email
        PaymentCompletedEvent paymentEvent = PaymentCompletedEvent.builder()
                .bill(transaction.getBill())
                .transaction(transaction)
                .build();
        eventPublisher.publishEvent(paymentEvent);

        log.info("Successfully processed payment success for transaction: {}", transaction.getTransactionNumber());
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
                .setFailureReason(paymentIntent.getLastPaymentError() != null ? paymentIntent.getLastPaymentError().getMessage()
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
     * Updates transaction status and related fields
     */
    private void updateTransactionStatus(PaymentTransaction transaction,
                                         PaymentTransaction.TransactionStatus status,
                                         PaymentIntent paymentIntent) {
        transaction.setStatus(status);
        transaction.setStripeChargeId(paymentIntent.getLatestCharge());
        transaction.setProcessedAt(Instant.now());
        paymentTransactionRepository.save(transaction);
    }

    /**
     * Updates bill status and related fields
     */
    private void updateBillStatus(Bill bill, BillingStatus status, PaymentIntent paymentIntent) {
        bill.setBillingStatus(status);
        bill.setStripePaymentIntentId(paymentIntent.getId());
        bill.setStripeChargeId(paymentIntent.getLatestCharge());
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

                log.info("Updated appointment {} status to PENDING after payment confirmation (PENDING_PAYMENT → PENDING)",
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

        // Find delivery associated with this prescription
        Optional<MedicationDelivery> deliveryOpt = deliveryRepository.findByPrescriptionId(prescriptionId);

        if (deliveryOpt.isPresent()) {
            MedicationDelivery delivery = deliveryOpt.get();

            // Update delivery status from PENDING_PAYMENT to PAID
            if (delivery.getStatus() == DeliveryStatus.PENDING_PAYMENT) {
                delivery.setStatus(DeliveryStatus.PAID);
                deliveryRepository.save(delivery);

                log.info("Updated delivery {} status to PAID after payment confirmation", delivery.getId());
            }
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
