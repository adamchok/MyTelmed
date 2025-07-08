package com.mytelmed.core.payment.service;

import com.mytelmed.common.advice.AppException;
import com.mytelmed.common.advice.exception.ResourceNotFoundException;
import com.mytelmed.common.constant.appointment.AppointmentStatus;
import com.mytelmed.common.constant.appointment.ConsultationMode;
import com.mytelmed.common.constant.payment.BillingStatus;
import com.mytelmed.common.event.payment.model.RefundCompletedEvent;
import com.mytelmed.common.event.payment.model.RefundFailedEvent;
import com.mytelmed.core.appointment.entity.Appointment;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.payment.entity.Bill;
import com.mytelmed.core.payment.entity.PaymentTransaction;
import com.mytelmed.core.payment.repository.BillRepository;
import com.mytelmed.core.payment.repository.PaymentTransactionRepository;
import com.stripe.exception.StripeException;
import com.stripe.model.Refund;
import com.stripe.param.RefundCreateParams;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * Comprehensive service for handling payment refunds in Malaysian public
 * healthcare telemedicine.
 * Provides production-ready Stripe refund integration with proper validation,
 * error handling,
 * retry logic, and scalability features.
 */
@Slf4j
@Service
public class PaymentRefundService {

  private final BillRepository billRepository;
  private final PaymentTransactionRepository paymentTransactionRepository;
  private final ApplicationEventPublisher eventPublisher;

  @Value("${stripe.secret.key:}")
  private String stripeSecretKey;

  @Value("${mytelmed.refund.policy.hours:24}")
  private int refundPolicyHours;

  public PaymentRefundService(
      BillRepository billRepository,
      PaymentTransactionRepository paymentTransactionRepository,
      ApplicationEventPublisher eventPublisher) {
    this.billRepository = billRepository;
    this.paymentTransactionRepository = paymentTransactionRepository;
    this.eventPublisher = eventPublisher;
  }

  /**
   * Processes refund for a cancelled virtual appointment.
   * This is the main method called when a virtual appointment is cancelled before
   * confirmation.
   */
  @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'ADMIN')")
  @Transactional
  @Retryable(value = { StripeException.class }, maxAttempts = 3, backoff = @Backoff(delay = 1000))
  public RefundResult processAppointmentCancellationRefund(
      UUID appointmentId,
      String cancellationReason,
      Account requestingAccount) throws AppException {

    log.info("Processing refund for cancelled appointment: {} by account: {}",
        appointmentId, requestingAccount.getId());

    // Find the bill associated with the appointment
    Optional<Bill> billOpt = billRepository.findByAppointmentId(appointmentId);
    if (billOpt.isEmpty()) {
      log.warn("No bill found for appointment: {}", appointmentId);
      return RefundResult.notRequired("No payment found for this appointment");
    }

    Bill bill = billOpt.get();

    // Validate refund eligibility
    validateRefundEligibility(bill, cancellationReason);

    // Find the associated payment transaction
    Optional<PaymentTransaction> transactionOpt = paymentTransactionRepository.findByBillId(bill.getId());
    if (transactionOpt.isEmpty()) {
      throw new AppException("No payment transaction found for this appointment");
    }

    PaymentTransaction transaction = transactionOpt.get();

    // Validate transaction eligibility
    validateTransactionRefundEligibility(transaction);

    try {
      // Process the refund with Stripe
      RefundResult refundResult = processStripeRefund(
          transaction.getStripeChargeId(),
          transaction.getAmount(),
          generateRefundReason(cancellationReason, bill),
          generateRefundMetadata(bill, transaction, requestingAccount));

      if (refundResult.isSuccessful()) {
        // Update bill and transaction records
        updateBillForRefund(bill, refundResult.getRefund(), cancellationReason);
        updateTransactionForRefund(transaction, refundResult.getRefund(), cancellationReason);

        // Publish refund completed event
        publishRefundCompletedEvent(bill, transaction, refundResult.getRefund());

        log.info("Successfully processed refund for appointment: {} with Stripe refund ID: {}",
            appointmentId, refundResult.getRefund().getId());
      } else {
        // Handle refund failure
        handleRefundFailure(bill, transaction, refundResult.getErrorMessage());
        log.error("Failed to process refund for appointment: {} - {}",
            appointmentId, refundResult.getErrorMessage());
      }

      return refundResult;
    } catch (StripeException e) {
      log.error("Stripe error processing refund for appointment: {}", appointmentId, e);
      handleRefundFailure(bill, transaction, e.getMessage());
      throw new AppException("Failed to process refund: " + e.getMessage());
    }
  }

  /**
   * Processes automatic refund for appointments cancelled by the system (e.g.,
   * scheduler).
   * This method is called by the scheduler service for unpaid appointments.
   */
  @Transactional
  @Retryable(value = { StripeException.class }, maxAttempts = 3, backoff = @Backoff(delay = 1000))
  public RefundResult processAutomaticRefund(UUID appointmentId, String systemReason) throws AppException {
    log.info("Processing automatic refund for appointment: {} due to: {}", appointmentId, systemReason);

    Optional<Bill> billOpt = billRepository.findByAppointmentId(appointmentId);
    if (billOpt.isEmpty()) {
      return RefundResult.notRequired("No payment found for automatic refund");
    }

    Bill bill = billOpt.get();

    // Only process if bill is paid and eligible for refund
    if (!bill.isEligibleForFullRefund()) {
      log.debug("Bill {} not eligible for automatic refund - Status: {}, Refund Status: {}",
          bill.getId(), bill.getBillingStatus(), bill.getRefundStatus());
      return RefundResult.notRequired("Bill not eligible for automatic refund");
    }

    Optional<PaymentTransaction> transactionOpt = paymentTransactionRepository.findByBillId(bill.getId());
    if (transactionOpt.isEmpty()) {
      log.warn("No transaction found for bill: {} during automatic refund", bill.getId());
      return RefundResult.notRequired("No transaction found for automatic refund");
    }

    PaymentTransaction transaction = transactionOpt.get();

    if (!transaction.isEligibleForFullRefund()) {
      log.debug("Transaction {} not eligible for automatic refund", transaction.getId());
      return RefundResult.notRequired("Transaction not eligible for automatic refund");
    }

    try {
      RefundResult refundResult = processStripeRefund(
          transaction.getStripeChargeId(),
          transaction.getAmount(),
          "Automatic refund: " + systemReason,
          generateAutomaticRefundMetadata(bill, transaction, systemReason));

      if (refundResult.isSuccessful()) {
        updateBillForRefund(bill, refundResult.getRefund(), systemReason);
        updateTransactionForRefund(transaction, refundResult.getRefund(), systemReason);
        publishRefundCompletedEvent(bill, transaction, refundResult.getRefund());

        log.info("Successfully processed automatic refund for appointment: {} with Stripe refund ID: {}",
            appointmentId, refundResult.getRefund().getId());
      } else {
        handleRefundFailure(bill, transaction, refundResult.getErrorMessage());
      }

      return refundResult;
    } catch (StripeException e) {
      log.error("Stripe error during automatic refund for appointment: {}", appointmentId, e);
      handleRefundFailure(bill, transaction, e.getMessage());
      throw new AppException("Failed to process automatic refund: " + e.getMessage());
    }
  }

  /**
   * Checks if an appointment is eligible for refund based on timing and status.
   */
  public boolean isAppointmentEligibleForRefund(Appointment appointment) {
    // Only virtual appointments require payment and therefore refunds
    if (appointment.getConsultationMode() != ConsultationMode.VIRTUAL) {
      return false;
    }

    // Can only refund appointments that are not yet confirmed/completed
    if (appointment.getStatus() == AppointmentStatus.CONFIRMED ||
        appointment.getStatus() == AppointmentStatus.READY_FOR_CALL ||
        appointment.getStatus() == AppointmentStatus.IN_PROGRESS ||
        appointment.getStatus() == AppointmentStatus.COMPLETED) {
      return false;
    }

    // Check refund policy timing (e.g., 24 hours before appointment)
    LocalDateTime appointmentTime = appointment.getTimeSlot().getStartTime();
    LocalDateTime now = LocalDateTime.now();
    LocalDateTime refundCutoff = appointmentTime.minusHours(refundPolicyHours);

    return now.isBefore(refundCutoff);
  }

  /**
   * Gets refund status for an appointment.
   */
  @Transactional(readOnly = true)
  public RefundStatus getAppointmentRefundStatus(UUID appointmentId) {
    Optional<Bill> billOpt = billRepository.findByAppointmentId(appointmentId);
    if (billOpt.isEmpty()) {
      return RefundStatus.builder()
          .hasPayment(false)
          .refundEligible(false)
          .message("No payment found for this appointment")
          .build();
    }

    Bill bill = billOpt.get();
    Optional<PaymentTransaction> transactionOpt = paymentTransactionRepository.findByBillId(bill.getId());

    return RefundStatus.builder()
        .hasPayment(true)
        .refundEligible(bill.isEligibleForFullRefund())
        .refundStatus(bill.getRefundStatus())
        .refundAmount(bill.getRefundAmount())
        .refundableAmount(bill.getRefundableAmount())
        .stripeRefundId(bill.getStripeRefundId())
        .refundedAt(bill.getRefundedAt())
        .message(getRefundStatusMessage(bill, transactionOpt.orElse(null)))
        .build();
  }

  // Private helper methods

  private void validateRefundEligibility(Bill bill, String reason) throws AppException {
    if (bill.getBillingStatus() != BillingStatus.PAID) {
      throw new AppException("Cannot refund unpaid bill");
    }

    if (!bill.isEligibleForFullRefund()) {
      String message = "Bill not eligible for refund";
      if (bill.getRefundStatus() == Bill.RefundStatus.REFUNDED) {
        message = "Bill has already been refunded";
      } else if (bill.getRefundStatus() == Bill.RefundStatus.REFUND_PROCESSING) {
        message = "Refund is already being processed";
      }
      throw new AppException(message);
    }

    // Validate appointment belongs to a virtual consultation
    if (bill.getAppointment() != null &&
        bill.getAppointment().getConsultationMode() != ConsultationMode.VIRTUAL) {
      throw new AppException("Refunds are only available for virtual consultations");
    }
  }

  private void validateTransactionRefundEligibility(PaymentTransaction transaction) throws AppException {
    if (!transaction.isEligibleForFullRefund()) {
      throw new AppException("Transaction not eligible for refund");
    }

    if (transaction.getStripeChargeId() == null || transaction.getStripeChargeId().isEmpty()) {
      throw new AppException("No Stripe charge ID found for transaction");
    }
  }

  private RefundResult processStripeRefund(
      String chargeId,
      BigDecimal amount,
      String reason,
      Map<String, String> metadata) throws StripeException {

    com.stripe.Stripe.apiKey = stripeSecretKey;

    log.debug("Processing Stripe refund for charge: {} amount: {} MYR", chargeId, amount);

    RefundCreateParams params = RefundCreateParams.builder()
        .setCharge(chargeId)
        .setAmount((long) (amount.doubleValue() * 100)) // Convert to cents
        .setReason(RefundCreateParams.Reason.REQUESTED_BY_CUSTOMER)
        .putAllMetadata(metadata)
        .build();

    try {
      Refund refund = Refund.create(params);
      log.info("Stripe refund created successfully: {} for charge: {}", refund.getId(), chargeId);
      return RefundResult.successful(refund);
    } catch (StripeException e) {
      log.error("Stripe refund failed for charge: {} - {}", chargeId, e.getMessage());
      return RefundResult.failed(e.getMessage());
    }
  }

  private void updateBillForRefund(Bill bill, Refund stripeRefund, String reason) {
    bill.setRefundStatus(Bill.RefundStatus.REFUNDED);
    bill.setRefundAmount(BigDecimal.valueOf(stripeRefund.getAmount() / 100.0));
    bill.setStripeRefundId(stripeRefund.getId());
    bill.setRefundReason(reason);
    bill.setRefundedAt(Instant.now());
    billRepository.save(bill);
  }

  private void updateTransactionForRefund(PaymentTransaction transaction, Refund stripeRefund, String reason) {
    transaction.setStatus(PaymentTransaction.TransactionStatus.REFUNDED);
    transaction.setRefundAmount(BigDecimal.valueOf(stripeRefund.getAmount() / 100.0));
    transaction.setStripeRefundId(stripeRefund.getId());
    transaction.setRefundReason(reason);
    transaction.setRefundedAt(Instant.now());
    paymentTransactionRepository.save(transaction);
  }

  private void handleRefundFailure(Bill bill, PaymentTransaction transaction, String errorMessage) {
    bill.setRefundStatus(Bill.RefundStatus.REFUND_FAILED);
    transaction.setStatus(PaymentTransaction.TransactionStatus.FAILED);

    billRepository.save(bill);
    paymentTransactionRepository.save(transaction);

    publishRefundFailedEvent(bill, transaction, errorMessage);
  }

  private String generateRefundReason(String cancellationReason, Bill bill) {
    return String.format("Appointment cancellation refund - %s (Bill: %s)",
        cancellationReason, bill.getBillNumber());
  }

  private Map<String, String> generateRefundMetadata(Bill bill, PaymentTransaction transaction, Account account) {
    Map<String, String> metadata = new HashMap<>();
    metadata.put("bill_id", bill.getId().toString());
    metadata.put("bill_number", bill.getBillNumber());
    metadata.put("transaction_id", transaction.getId().toString());
    metadata.put("patient_id", bill.getPatient().getId().toString());
    metadata.put("refund_type", "appointment_cancellation");
    metadata.put("requested_by", account.getId().toString());
    metadata.put("refund_timestamp", Instant.now().toString());

    if (bill.getAppointment() != null) {
      metadata.put("appointment_id", bill.getAppointment().getId().toString());
    }

    return metadata;
  }

  private Map<String, String> generateAutomaticRefundMetadata(Bill bill, PaymentTransaction transaction,
      String reason) {
    Map<String, String> metadata = new HashMap<>();
    metadata.put("bill_id", bill.getId().toString());
    metadata.put("bill_number", bill.getBillNumber());
    metadata.put("transaction_id", transaction.getId().toString());
    metadata.put("patient_id", bill.getPatient().getId().toString());
    metadata.put("refund_type", "automatic_system_refund");
    metadata.put("system_reason", reason);
    metadata.put("refund_timestamp", Instant.now().toString());

    if (bill.getAppointment() != null) {
      metadata.put("appointment_id", bill.getAppointment().getId().toString());
    }

    return metadata;
  }

  private String getRefundStatusMessage(Bill bill, PaymentTransaction transaction) {
    if (bill.getBillingStatus() != BillingStatus.PAID) {
      return "No refund needed - payment not completed";
    }

    return switch (bill.getRefundStatus()) {
      case REFUNDED -> "Full refund completed";
      case REFUND_PROCESSING -> "Refund is being processed";
      case REFUND_FAILED -> "Refund failed - please contact support";
      case PARTIAL_REFUND -> "Partial refund completed";
      case NOT_REFUNDED ->
        bill.isEligibleForFullRefund() ? "Eligible for full refund" : "Not eligible for refund";
      default -> "Unknown refund status";
    };
  }

  private void publishRefundCompletedEvent(Bill bill, PaymentTransaction transaction, Refund stripeRefund) {
    try {
      RefundCompletedEvent event = RefundCompletedEvent.builder()
          .bill(bill)
          .transaction(transaction)
          .stripeRefundId(stripeRefund.getId())
          .refundAmount(BigDecimal.valueOf(stripeRefund.getAmount() / 100.0))
          .refundReason(bill.getRefundReason())
          .build();

      eventPublisher.publishEvent(event);
      log.debug("Published RefundCompletedEvent for bill: {}", bill.getId());
    } catch (Exception e) {
      log.error("Failed to publish RefundCompletedEvent for bill: {}", bill.getId(), e);
    }
  }

  private void publishRefundFailedEvent(Bill bill, PaymentTransaction transaction, String errorMessage) {
    try {
      RefundFailedEvent event = RefundFailedEvent.builder()
          .bill(bill)
          .transaction(transaction)
          .errorMessage(errorMessage)
          .failedAt(Instant.now())
          .build();

      eventPublisher.publishEvent(event);
      log.debug("Published RefundFailedEvent for bill: {}", bill.getId());
    } catch (Exception e) {
      log.error("Failed to publish RefundFailedEvent for bill: {}", bill.getId(), e);
    }
  }

  // Helper classes for return values

  public static class RefundResult {
    private final boolean successful;
    private final Refund refund;
    private final String errorMessage;
    private final String message;

    private RefundResult(boolean successful, Refund refund, String errorMessage, String message) {
      this.successful = successful;
      this.refund = refund;
      this.errorMessage = errorMessage;
      this.message = message;
    }

    public static RefundResult successful(Refund refund) {
      return new RefundResult(true, refund, null, "Refund processed successfully");
    }

    public static RefundResult failed(String errorMessage) {
      return new RefundResult(false, null, errorMessage, "Refund failed");
    }

    public static RefundResult notRequired(String message) {
      return new RefundResult(true, null, null, message);
    }

    public boolean isSuccessful() {
      return successful;
    }

    public Refund getRefund() {
      return refund;
    }

    public String getErrorMessage() {
      return errorMessage;
    }

    public String getMessage() {
      return message;
    }
  }

  @lombok.Builder
  @lombok.Data
  public static class RefundStatus {
    private boolean hasPayment;
    private boolean refundEligible;
    private Bill.RefundStatus refundStatus;
    private BigDecimal refundAmount;
    private BigDecimal refundableAmount;
    private String stripeRefundId;
    private Instant refundedAt;
    private String message;
  }
}