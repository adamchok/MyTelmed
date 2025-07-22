package com.mytelmed.core.payment.strategy.impl;

import com.mytelmed.common.advice.AppException;
import com.mytelmed.common.constant.delivery.DeliveryMethod;
import com.mytelmed.common.constant.family.FamilyPermissionType;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.delivery.entity.MedicationDelivery;
import com.mytelmed.core.delivery.repository.MedicationDeliveryRepository;
import com.mytelmed.core.family.service.FamilyMemberPermissionService;
import com.mytelmed.core.payment.strategy.PaymentValidationStrategy;
import com.mytelmed.core.prescription.entity.Prescription;
import com.mytelmed.core.prescription.service.PrescriptionService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Payment validation strategy for prescriptions/deliveries.
 * Handles business rules specific to medication delivery payments.
 */
@Slf4j
@Component
public class PrescriptionPaymentValidationStrategy implements PaymentValidationStrategy {

    private final PrescriptionService prescriptionService;
    private final MedicationDeliveryRepository deliveryRepository;
    private final FamilyMemberPermissionService familyPermissionService;
    private final BigDecimal deliveryFee;

    public PrescriptionPaymentValidationStrategy(PrescriptionService prescriptionService,
            MedicationDeliveryRepository deliveryRepository,
            FamilyMemberPermissionService familyPermissionService,
            @Value("${mytelmed.prescription.delivery.fee}") BigDecimal deliveryFee) {
        this.prescriptionService = prescriptionService;
        this.deliveryRepository = deliveryRepository;
        this.familyPermissionService = familyPermissionService;
        this.deliveryFee = deliveryFee;
    }

    @Override
    public boolean isPaymentRequired(UUID prescriptionId) throws AppException {
        log.debug("Checking payment requirement for prescription: {}", prescriptionId);

        // Check if there's an active delivery associated with this prescription
        // (OneToMany relationship)
        Optional<MedicationDelivery> deliveryOpt = deliveryRepository
                .findLatestNonCancelledByPrescriptionId(prescriptionId);

        if (deliveryOpt.isEmpty()) {
            log.debug("No active delivery found for prescription {}, payment not required", prescriptionId);
            return false;
        }

        MedicationDelivery delivery = deliveryOpt.get();

        // Payment is only required for HOME_DELIVERY, not for PICKUP
        boolean paymentRequired = delivery.getDeliveryMethod() == DeliveryMethod.HOME_DELIVERY;

        log.debug("Payment required for {} delivery of prescription {}: {}",
                delivery.getDeliveryMethod(), prescriptionId, paymentRequired);

        return paymentRequired;
    }

    @Override
    public boolean isAuthorizedToPayFor(Account account, UUID prescriptionId) throws AppException {
        log.debug("Checking payment authorization for account {} and prescription {}",
                account.getId(), prescriptionId);

        Prescription prescription = prescriptionService.findById(prescriptionId);
        UUID patientId = prescription.getPatient().getId();

        // Get all patient IDs this account is authorized to access
        List<UUID> authorizedPatientIds = familyPermissionService.getAuthorizedPatientIds(account);
        if (authorizedPatientIds.isEmpty()) {
            log.debug("Account {} not authorized for any patient", account.getId());
            return false;
        }

        // Check if the prescription belongs to one of the authorized patients
        if (!authorizedPatientIds.contains(patientId)) {
            log.debug(
                    "Account {} not authorized for patient {} (prescription belongs to patient not in authorized list)",
                    account.getId(), patientId);
            return false;
        }

        // Check if account has BOOK_APPOINTMENT permission (used for payment
        // authorization)
        boolean hasPermission = familyPermissionService.hasPermission(
                account, patientId, FamilyPermissionType.MANAGE_BILLING);

        log.debug("Account {} has BOOK_APPOINTMENT permission for patient {}: {}",
                account.getId(), patientId, hasPermission);

        return hasPermission;
    }

    @Override
    public UUID getPatientIdForEntity(UUID prescriptionId) throws AppException {
        log.debug("Getting patient ID for prescription: {}", prescriptionId);

        Prescription prescription = prescriptionService.findById(prescriptionId);
        UUID patientId = prescription.getPatient().getId();

        log.debug("Patient ID for prescription {}: {}", prescriptionId, patientId);
        return patientId;
    }

    @Override
    public BigDecimal getExpectedPaymentAmount(UUID prescriptionId) throws AppException {
        log.debug("Getting expected payment amount for prescription: {}", prescriptionId);

        if (isPaymentRequired(prescriptionId)) {
            log.debug("Delivery fee for prescription {}: RM {}", prescriptionId, deliveryFee);
            return deliveryFee;
        } else {
            log.debug("No payment required for prescription: {}", prescriptionId);
            return BigDecimal.ZERO;
        }
    }
}