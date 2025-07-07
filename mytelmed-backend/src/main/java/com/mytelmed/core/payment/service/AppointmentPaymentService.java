package com.mytelmed.core.payment.service;

import com.mytelmed.common.advice.AppException;
import com.mytelmed.common.constant.appointment.AppointmentStatus;
import com.mytelmed.common.constant.payment.BillingStatus;
import com.mytelmed.core.appointment.entity.Appointment;
import com.mytelmed.core.appointment.repository.AppointmentRepository;
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

  public AppointmentPaymentService(BillRepository billRepository,
      AppointmentRepository appointmentRepository) {
    this.billRepository = billRepository;
    this.appointmentRepository = appointmentRepository;
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

    // Update appointment status to confirmed/pending
    if (appointment.getStatus() == AppointmentStatus.PENDING_PAYMENT) {
      appointment.setStatus(AppointmentStatus.PENDING);
      appointmentRepository.save(appointment);
      log.info("Appointment {} confirmed after successful payment", appointmentId);
    }
  }

  @Transactional(readOnly = true)
  public boolean hasPaymentCompleted(UUID appointmentId) {
    return billRepository.findByAppointmentId(appointmentId)
        .map(bill -> bill.getBillingStatus() == BillingStatus.PAID)
        .orElse(false);
  }

  @Transactional(readOnly = true)
  public boolean requiresPayment(Appointment appointment) {
    return appointment.getVideoCall() != null;
  }
}