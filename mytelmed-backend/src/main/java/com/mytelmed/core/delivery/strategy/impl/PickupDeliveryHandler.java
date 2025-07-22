package com.mytelmed.core.delivery.strategy.impl;

import com.mytelmed.common.advice.AppException;
import com.mytelmed.common.constant.delivery.DeliveryMethod;
import com.mytelmed.common.constant.delivery.DeliveryStatus;
import com.mytelmed.core.delivery.entity.MedicationDelivery;
import com.mytelmed.core.delivery.strategy.DeliveryHandler;
import com.mytelmed.core.prescription.entity.Prescription;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.time.Instant;

/**
 * Pickup delivery handler for Malaysian public healthcare telemedicine.
 * Handles pharmacy pickup workflow where patients collect medication from
 * healthcare facility.
 */
@Slf4j
@Component
public class PickupDeliveryHandler implements DeliveryHandler {

    @Override
    public DeliveryMethod getSupportedDeliveryMethod() {
        return DeliveryMethod.PICKUP;
    }

    @Override
    public MedicationDelivery initializeDelivery(Prescription prescription) {
        log.info("Initializing pickup delivery for prescription: {}", prescription.getId());

        return MedicationDelivery.builder()
                .prescription(prescription)
                .deliveryMethod(DeliveryMethod.PICKUP)
                .status(DeliveryStatus.PENDING_PICKUP) // Skip payment for pickup
                .deliveryFee(BigDecimal.ZERO) // No delivery fee for pickup
                .deliveryInstructions(
                        "Please collect your medication from the pharmacy during operating hours: 8:00 AM - 6:00 PM, Monday to Friday")
                .build();
    }

    @Override
    public void processDelivery(MedicationDelivery delivery) {
        log.info("Processing pickup delivery: {}", delivery.getId());

        if (!canProcess(delivery)) {
            throw new AppException("Pickup delivery cannot be processed in current status: " + delivery.getStatus());
        }

        delivery.setStatus(DeliveryStatus.PREPARING);
        log.info("Pickup delivery {} moved to PREPARING status", delivery.getId());
    }

    /**
     * Marks pickup delivery as ready for pickup by patient
     */
    public void markReadyForPickup(MedicationDelivery delivery) {
        log.info("Marking pickup delivery as ready for pickup: {}", delivery.getId());

        if (delivery.getStatus() != DeliveryStatus.PREPARING) {
            throw new AppException(
                    "Pickup delivery must be in PREPARING status to mark as ready, current: " + delivery.getStatus());
        }

        delivery.setStatus(DeliveryStatus.READY_FOR_PICKUP);
        delivery.setPickupDate(Instant.now()); // Set when ready for pickup
        delivery.setDeliveryNotes("Medication is ready for pickup at the pharmacy");

        log.info("Pickup delivery {} marked as ready for pickup", delivery.getId());
    }

    @Override
    public void completeDelivery(MedicationDelivery delivery) {
        log.info("Completing pickup delivery: {}", delivery.getId());

        if (delivery.getStatus() != DeliveryStatus.READY_FOR_PICKUP) {
            throw new AppException(
                    "Pickup delivery must be in READY_FOR_PICKUP status to complete, current: " + delivery.getStatus());
        }

        delivery.setActualDeliveryDate(Instant.now()); // Set actual delivery date when completed
        delivery.setStatus(DeliveryStatus.DELIVERED); // Use DELIVERED status for consistency
        delivery.setDeliveryNotes("Medication successfully picked up by patient from pharmacy");

        log.info("Pickup delivery {} completed successfully", delivery.getId());
    }

    @Override
    public void cancelDelivery(MedicationDelivery delivery, String reason) {
        log.info("Cancelling pickup delivery: {} with reason: {}", delivery.getId(), reason);

        delivery.setStatus(DeliveryStatus.CANCELLED);
        delivery.setCancellationReason(reason);

        log.info("Pickup delivery {} cancelled", delivery.getId());
    }

    @Override
    public BigDecimal calculateDeliveryFee(MedicationDelivery delivery) {
        return BigDecimal.ZERO; // No fee for pickup
    }

    @Override
    public boolean canProcess(MedicationDelivery delivery) {
        return delivery.getDeliveryMethod() == DeliveryMethod.PICKUP &&
                (delivery.getStatus() == DeliveryStatus.PENDING_PICKUP
                        || delivery.getStatus() == DeliveryStatus.PREPARING);
    }

    /**
     * Checks if pickup delivery can be marked as ready for pickup
     */
    public boolean canMarkReadyForPickup(MedicationDelivery delivery) {
        return delivery.getDeliveryMethod() == DeliveryMethod.PICKUP &&
                delivery.getStatus() == DeliveryStatus.PREPARING;
    }

    /**
     * Checks if pickup delivery can be completed (marked as delivered)
     */
    public boolean canComplete(MedicationDelivery delivery) {
        return delivery.getDeliveryMethod() == DeliveryMethod.PICKUP &&
                delivery.getStatus() == DeliveryStatus.READY_FOR_PICKUP;
    }
}
