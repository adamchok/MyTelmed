package com.mytelmed.core.appointment.service;

import com.mytelmed.common.advice.AppException;
import com.mytelmed.common.constant.appointment.AppointmentStatus;
import com.mytelmed.common.constant.appointment.ConsultationMode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Set;

/**
 * State machine for managing appointment status transitions
 * Ensures business rules are followed for state changes
 */
@Slf4j
@Component
public class AppointmentStateMachine {

  private static final Map<AppointmentStatus, Set<AppointmentStatus>> ALLOWED_TRANSITIONS = Map.of(
      AppointmentStatus.PENDING_PAYMENT, Set.of(
          AppointmentStatus.PENDING, // After successful payment
          AppointmentStatus.CANCELLED),

      AppointmentStatus.PENDING, Set.of(
          AppointmentStatus.CONFIRMED, // For virtual appointment (automated by scheduler)
          AppointmentStatus.CANCELLED),

      AppointmentStatus.CONFIRMED, Set.of(
          AppointmentStatus.READY_FOR_CALL, // For virtual appointment (automated by scheduler)
          AppointmentStatus.IN_PROGRESS, // For physical appointment (automated by scheduler)
          AppointmentStatus.NO_SHOW),

      AppointmentStatus.READY_FOR_CALL, Set.of(
          AppointmentStatus.IN_PROGRESS, // When both patient (themself or family) and doctor join the video call.
          AppointmentStatus.NO_SHOW),

      AppointmentStatus.IN_PROGRESS, Set.of(
          AppointmentStatus.COMPLETED), // When all parties in the virtual appointment left the call. Or when physical
                                        // appointment is completed.

      // Terminal states
      AppointmentStatus.COMPLETED, Set.of(),
      AppointmentStatus.CANCELLED, Set.of(),
      AppointmentStatus.NO_SHOW, Set.of());

  /**
   * Checks if a status transition is allowed
   */
  public boolean canTransition(AppointmentStatus fromStatus, AppointmentStatus toStatus) {
    Set<AppointmentStatus> allowedTransitions = ALLOWED_TRANSITIONS.get(fromStatus);
    return allowedTransitions != null && allowedTransitions.contains(toStatus);
  }

  /**
   * Validates and performs a status transition
   */
  public void validateTransition(AppointmentStatus fromStatus, AppointmentStatus toStatus,
      ConsultationMode consultationMode) throws AppException {

    if (!canTransition(fromStatus, toStatus)) {
      throw new AppException(String.format(
          "Invalid appointment status transition from %s to %s", fromStatus, toStatus));
    }

    // Additional business rule validations
    validateTransitionBusinessRules(fromStatus, toStatus, consultationMode);
  }

  /**
   * Gets the next status after successful payment for different consultation
   * modes
   */
  public AppointmentStatus getStatusAfterPayment(ConsultationMode consultationMode) {
    return switch (consultationMode) {
      case VIRTUAL -> AppointmentStatus.PENDING; // Updated: Virtual appointments go to PENDING after payment
      case PHYSICAL -> AppointmentStatus.PENDING; // Physical appointments also start at PENDING
    };
  }

  /**
   * Gets the appropriate status for appointment confirmation
   */
  public AppointmentStatus getConfirmationStatus(ConsultationMode consultationMode) {
    return switch (consultationMode) {
      case VIRTUAL -> AppointmentStatus.CONFIRMED; // Updated: Virtual appointments go to CONFIRMED (automated by
                                                   // scheduler)
      case PHYSICAL -> AppointmentStatus.CONFIRMED; // Physical appointments also go to CONFIRMED
    };
  }

  /**
   * Validates business rules specific to transitions
   */
  private void validateTransitionBusinessRules(AppointmentStatus fromStatus, AppointmentStatus toStatus,
      ConsultationMode consultationMode) throws AppException {

    // Virtual appointment specific rules
    if (consultationMode == ConsultationMode.VIRTUAL) {
      validateVirtualAppointmentTransition(fromStatus, toStatus);
    }

    // Physical appointment specific rules
    if (consultationMode == ConsultationMode.PHYSICAL) {
      validatePhysicalAppointmentTransition(fromStatus, toStatus);
    }
  }

  /**
   * Validates virtual appointment transitions
   */
  private void validateVirtualAppointmentTransition(AppointmentStatus fromStatus, AppointmentStatus toStatus)
      throws AppException {

    // Virtual appointments cannot go directly from PENDING to IN_PROGRESS
    if (fromStatus == AppointmentStatus.PENDING && toStatus == AppointmentStatus.IN_PROGRESS) {
      throw new AppException("Virtual appointments must be in READY_FOR_CALL status before starting");
    }

    // Virtual appointments cannot be confirmed without payment
    if (fromStatus == AppointmentStatus.PENDING_PAYMENT && toStatus == AppointmentStatus.CONFIRMED) {
      throw new AppException("Virtual appointments cannot be confirmed without payment completion");
    }
  }

  /**
   * Validates physical appointment transitions
   */
  private void validatePhysicalAppointmentTransition(AppointmentStatus fromStatus, AppointmentStatus toStatus)
      throws AppException {

    // Physical appointments don't use READY_FOR_CALL status
    if (toStatus == AppointmentStatus.READY_FOR_CALL) {
      throw new AppException("Physical appointments cannot use READY_FOR_CALL status");
    }
  }

  /**
   * Determines if an appointment requires payment before confirmation
   */
  public boolean requiresPaymentBeforeConfirmation(ConsultationMode consultationMode) {
    return consultationMode == ConsultationMode.VIRTUAL;
  }

  /**
   * Gets all possible next statuses for the current status
   */
  public Set<AppointmentStatus> getPossibleTransitions(AppointmentStatus currentStatus) {
    return ALLOWED_TRANSITIONS.getOrDefault(currentStatus, Set.of());
  }
}