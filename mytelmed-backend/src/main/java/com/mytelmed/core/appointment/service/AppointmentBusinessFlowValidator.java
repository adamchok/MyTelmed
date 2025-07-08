package com.mytelmed.core.appointment.service;

import com.mytelmed.common.advice.AppException;
import com.mytelmed.common.constant.appointment.AppointmentStatus;
import com.mytelmed.common.constant.appointment.ConsultationMode;
import com.mytelmed.core.appointment.entity.Appointment;
import com.mytelmed.core.doctor.entity.Doctor;
import com.mytelmed.core.patient.entity.Patient;
import com.mytelmed.core.timeslot.entity.TimeSlot;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Comprehensive business flow validator for appointments
 * Contains all validation logic that ensures business rules are followed
 */
@Slf4j
@Component
public class AppointmentBusinessFlowValidator {

  private final AppointmentStateMachine appointmentStateMachine;

  public AppointmentBusinessFlowValidator(AppointmentStateMachine appointmentStateMachine) {
    this.appointmentStateMachine = appointmentStateMachine;
  }

  /**
   * Validates complete appointment booking flow
   */
  public void validateAppointmentBookingFlow(Patient patient, Doctor doctor, TimeSlot timeSlot,
      ConsultationMode consultationMode) throws AppException {

    log.debug("Validating appointment booking flow for patient: {}, doctor: {}, consultation mode: {}",
        patient.getId(), doctor.getId(), consultationMode);

    // 1. Validate time slot is available and not in past
    validateTimeSlotAvailability(timeSlot);

    // 2. Validate consultation mode compatibility
    validateConsultationModeCompatibility(timeSlot, consultationMode);

    // 3. Validate patient eligibility
    validatePatientEligibility(patient, consultationMode);

    // 4. Validate doctor capability
    validateDoctorCapability(doctor, consultationMode);

    // 5. Validate time slot ownership
    validateTimeSlotOwnership(timeSlot, doctor);

    log.debug("Appointment booking flow validation passed for patient: {}, doctor: {}",
        patient.getId(), doctor.getId());
  }

  /**
   * Validates appointment status transition
   */
  public void validateStatusTransition(Appointment appointment, AppointmentStatus newStatus) throws AppException {
    log.debug("Validating status transition from {} to {} for appointment: {}",
        appointment.getStatus(), newStatus, appointment.getId());

    appointmentStateMachine.validateTransition(
        appointment.getStatus(),
        newStatus,
        appointment.getConsultationMode());

    log.debug("Status transition validation passed for appointment: {}", appointment.getId());
  }

  /**
   * Validates payment flow consistency
   */
  public void validatePaymentFlow(Appointment appointment, AppointmentStatus targetStatus) throws AppException {
    log.debug("Validating payment flow for appointment: {} targeting status: {}",
        appointment.getId(), targetStatus);

    // Check if appointment requires payment
    if (appointmentStateMachine.requiresPaymentBeforeConfirmation(appointment.getConsultationMode())) {

      // Virtual appointments must go through payment flow
      if (appointment.getStatus() == AppointmentStatus.PENDING &&
          targetStatus != AppointmentStatus.PENDING_PAYMENT &&
          targetStatus != AppointmentStatus.CANCELLED) {
        throw new AppException("Virtual appointments must complete payment before confirmation");
      }
    }

    log.debug("Payment flow validation passed for appointment: {}", appointment.getId());
  }

  /**
   * Validates time slot race condition protection
   */
  public void validateRaceConditionProtection(TimeSlot timeSlot) throws AppException {
    if (timeSlot.getIsBooked()) {
      throw new AppException("Time slot race condition detected - slot was booked by another process");
    }

    if (!timeSlot.getIsAvailable()) {
      throw new AppException("Time slot race condition detected - slot became unavailable");
    }
  }

  // Private validation methods

  private void validateTimeSlotAvailability(TimeSlot timeSlot) throws AppException {
    if (timeSlot.getIsBooked()) {
      throw new AppException("Time slot is already booked");
    }

    if (!timeSlot.getIsAvailable()) {
      throw new AppException("Time slot is not available");
    }

    if (timeSlot.getStartTime().isBefore(LocalDateTime.now())) {
      throw new AppException("Cannot book time slot in the past");
    }
  }

  private void validateConsultationModeCompatibility(TimeSlot timeSlot, ConsultationMode requestedMode)
      throws AppException {
    if (!timeSlot.supportsConsultationMode(requestedMode)) {
      throw new AppException(String.format(
          "Time slot supports %s mode but %s mode was requested",
          timeSlot.getConsultationMode(), requestedMode));
    }
  }

  private void validatePatientEligibility(Patient patient, ConsultationMode consultationMode) throws AppException {
    if (consultationMode == ConsultationMode.VIRTUAL) {
      // Age restriction for virtual consultations
      int age = java.time.Period.between(patient.getDateOfBirth(), java.time.LocalDate.now()).getYears();
      if (age < 13) {
        throw new AppException("Virtual consultations require patient to be at least 13 years old");
      }
    }
  }

  private void validateDoctorCapability(Doctor doctor, ConsultationMode consultationMode) throws AppException {
    // Future: Check if doctor is certified for virtual consultations
    // For now, assume all doctors can handle both modes
  }

  private void validateTimeSlotOwnership(TimeSlot timeSlot, Doctor doctor) throws AppException {
    if (!timeSlot.getDoctor().getId().equals(doctor.getId())) {
      throw new AppException("Time slot does not belong to the selected doctor");
    }
  }
}