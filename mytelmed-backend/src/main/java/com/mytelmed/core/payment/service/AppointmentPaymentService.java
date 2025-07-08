package com.mytelmed.core.payment.service;

import com.mytelmed.common.advice.AppException;
import com.mytelmed.common.constant.appointment.AppointmentStatus;
import com.mytelmed.common.constant.payment.BillingStatus;
import com.mytelmed.core.appointment.entity.Appointment;
import com.mytelmed.core.appointment.repository.AppointmentRepository;
import com.mytelmed.core.appointment.service.AppointmentStateMachine;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.payment.entity.Bill;
import com.mytelmed.core.payment.repository.BillRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

@Slf4j
@Service
public class AppointmentPaymentService {
  private final BillRepository billRepository;
  private final AppointmentRepository appointmentRepository;
  private final AppointmentStateMachine appointmentStateMachine;

  public AppointmentPaymentService(BillRepository billRepository,
      AppointmentRepository appointmentRepository,
      AppointmentStateMachine appointmentStateMachine) {
    this.billRepository = billRepository;
    this.appointmentRepository = appointmentRepository;
    this.appointmentStateMachine = appointmentStateMachine;
  }

  @PreAuthorize("hasRole('PATIENT')")
  @Transactional
  public void confirmAppointmentPayment(Account account, UUID appointmentId) throws AppException {
    log.info("Confirming appointment payment for appointment: {} by patient: {}", appointmentId, account.getId());

    // Find the appointment
    Appointment appointment = appointmentRepository.findById(appointmentId)
        .orElseThrow(() -> new AppException("Appointment not found"));

    // Verify patient owns the appointment
    if (!appointment.getPatient().getAccount().getId().equals(account.getId())) {
      throw new AppException("Not authorized to confirm payment for this appointment");
    }

    // Find the bill for this appointment
    Bill bill = billRepository.findByAppointmentId(appointmentId)
        .orElseThrow(() -> new AppException("Payment record not found for this appointment"));

    // Check if payment is completed
    if (bill.getBillingStatus() != BillingStatus.PAID) {
      throw new AppException("Payment is not completed for this appointment");
    }

    // Validate current appointment status allows payment confirmation
    if (!canConfirmPayment(appointment.getStatus())) {
      throw new AppException(String.format(
          "Cannot confirm payment for appointment in %s status", appointment.getStatus()));
    }

    // Determine next status based on consultation mode using state machine
    // Updated: Both virtual and physical appointments go to PENDING after payment
    AppointmentStatus nextStatus = appointmentStateMachine.getStatusAfterPayment(appointment.getConsultationMode());

    // Validate the transition
    appointmentStateMachine.validateTransition(
        appointment.getStatus(),
        nextStatus,
        appointment.getConsultationMode());

    // Update appointment status
    appointment.setStatus(nextStatus);
    appointmentRepository.save(appointment);

    log.info("Appointment {} status updated to {} after successful payment (PENDING_PAYMENT → PENDING)",
        appointmentId, nextStatus);
  }

  @Transactional(readOnly = true)
  public boolean hasPaymentCompleted(UUID appointmentId) {
    return billRepository.findByAppointmentId(appointmentId)
        .map(bill -> bill.getBillingStatus() == BillingStatus.PAID)
        .orElse(false);
  }

  @Transactional(readOnly = true)
  public boolean requiresPayment(Appointment appointment) {
    return appointmentStateMachine.requiresPaymentBeforeConfirmation(appointment.getConsultationMode());
  }

  /**
   * Checks if payment can be confirmed for the given appointment status
   */
  private boolean canConfirmPayment(AppointmentStatus status) {
    return status == AppointmentStatus.PENDING_PAYMENT;
  }

  /**
   * Handles payment failure - reverts appointment to appropriate status
   */
  @PreAuthorize("hasRole('PATIENT')")
  @Transactional
  public void handlePaymentFailure(Account account, UUID appointmentId, String failureReason) throws AppException {
    log.info("Handling payment failure for appointment: {} by patient: {}", appointmentId, account.getId());

    // Find the appointment
    Appointment appointment = appointmentRepository.findById(appointmentId)
        .orElseThrow(() -> new AppException("Appointment not found"));

    // Verify patient owns the appointment
    if (!appointment.getPatient().getAccount().getId().equals(account.getId())) {
      throw new AppException("Not authorized to handle payment for this appointment");
    }

    // Only handle payment failures for appointments that are pending payment
    if (appointment.getStatus() != AppointmentStatus.PENDING_PAYMENT) {
      throw new AppException("Can only handle payment failures for appointments with PENDING_PAYMENT status");
    }

    // For virtual appointments, payment failure means cancellation
    if (appointment.getConsultationMode().equals(com.mytelmed.common.constant.appointment.ConsultationMode.VIRTUAL)) {
      appointmentStateMachine.validateTransition(
          appointment.getStatus(),
          AppointmentStatus.CANCELLED,
          appointment.getConsultationMode());

      appointment.setStatus(AppointmentStatus.CANCELLED);
      appointment.setCancellationReason("Payment failed: " + failureReason);
    }

    appointmentRepository.save(appointment);
    log.info("Appointment {} cancelled due to payment failure", appointmentId);
  }

  /**
   * Gets the payment amount for an appointment
   */
  @Transactional(readOnly = true)
  public java.math.BigDecimal getAppointmentPaymentAmount(UUID appointmentId) throws AppException {
    Bill bill = billRepository.findByAppointmentId(appointmentId)
        .orElseThrow(() -> new AppException("No bill found for this appointment"));

    return bill.getAmount();
  }

  /**
   * Checks if an appointment has an outstanding payment
   */
  @Transactional(readOnly = true)
  public boolean hasOutstandingPayment(UUID appointmentId) {
    return billRepository.findByAppointmentId(appointmentId)
        .map(bill -> bill.getBillingStatus() == BillingStatus.UNPAID)
        .orElse(false);
  }
}