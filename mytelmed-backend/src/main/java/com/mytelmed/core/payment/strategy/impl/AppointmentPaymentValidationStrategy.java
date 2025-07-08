package com.mytelmed.core.payment.strategy.impl;

import com.mytelmed.common.advice.AppException;
import com.mytelmed.common.constant.appointment.ConsultationMode;
import com.mytelmed.common.constant.family.FamilyPermissionType;
import com.mytelmed.core.appointment.entity.Appointment;
import com.mytelmed.core.appointment.service.AppointmentService;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.family.service.FamilyMemberPermissionService;
import com.mytelmed.core.payment.strategy.PaymentValidationStrategy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.util.UUID;


/**
 * Payment validation strategy for appointments.
 * Handles business rules specific to appointment payments.
 */
@Slf4j
@Component
public class AppointmentPaymentValidationStrategy implements PaymentValidationStrategy {

    private final AppointmentService appointmentService;
    private final FamilyMemberPermissionService familyPermissionService;
    private final BigDecimal consultationFee;

    public AppointmentPaymentValidationStrategy(AppointmentService appointmentService,
                                                FamilyMemberPermissionService familyPermissionService,
                                                @Value("${mytelmed.appointment.consultation.fee}") BigDecimal consultationFee) {
        this.appointmentService = appointmentService;
        this.familyPermissionService = familyPermissionService;
        this.consultationFee = consultationFee;
    }

    @Override
    public boolean isPaymentRequired(UUID appointmentId) throws AppException {
        log.debug("Checking payment requirement for appointment: {}", appointmentId);

        Appointment appointment = appointmentService.findById(appointmentId);

        // Only VIRTUAL consultations require upfront payment
        boolean paymentRequired = appointment.getConsultationMode() == ConsultationMode.VIRTUAL;

        log.debug("Payment required for {} appointment {}: {}",
                appointment.getConsultationMode(), appointmentId, paymentRequired);

        return paymentRequired;
    }

    @Override
    public boolean isAuthorizedToPayFor(Account account, UUID appointmentId) throws AppException {
        log.debug("Checking payment authorization for account {} and appointment {}",
                account.getId(), appointmentId);

        Appointment appointment = appointmentService.findById(appointmentId);
        UUID patientId = appointment.getPatient().getId();

        // Get the patient ID this account is authorized to access
        UUID authorizedPatientId = familyPermissionService.getAuthorizedPatientId(account);
        if (authorizedPatientId == null) {
            log.debug("Account {} not authorized for any patient", account.getId());
            return false;
        }

        // Check if the appointment belongs to the authorized patient
        if (!patientId.equals(authorizedPatientId)) {
            log.debug("Account {} not authorized for patient {} (appointment belongs to {})",
                    account.getId(), authorizedPatientId, patientId);
            return false;
        }

        // Check if account has BOOK_APPOINTMENT permission (required for payment)
        boolean hasPermission = familyPermissionService.hasPermission(
                account, patientId, FamilyPermissionType.BOOK_APPOINTMENT);

        log.debug("Account {} has BOOK_APPOINTMENT permission for patient {}: {}",
                account.getId(), patientId, hasPermission);

        return hasPermission;
    }

    @Override
    public UUID getPatientIdForEntity(UUID appointmentId) throws AppException {
        log.debug("Getting patient ID for appointment: {}", appointmentId);

        Appointment appointment = appointmentService.findById(appointmentId);
        UUID patientId = appointment.getPatient().getId();

        log.debug("Patient ID for appointment {}: {}", appointmentId, patientId);
        return patientId;
    }

    @Override
    public BigDecimal getExpectedPaymentAmount(UUID appointmentId) throws AppException {
        log.debug("Getting expected payment amount for appointment: {}", appointmentId);

        Appointment appointment = appointmentService.findById(appointmentId);

        if (appointment.getConsultationMode() == ConsultationMode.VIRTUAL) {
            log.debug("Virtual consultation fee for appointment {}: {}", appointmentId, consultationFee);
            return consultationFee;
        } else {
            log.debug("Physical consultation requires no upfront payment for appointment: {}", appointmentId);
            return BigDecimal.ZERO;
        }
    }
}