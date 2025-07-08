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
        .status(DeliveryStatus.PAID) // Skip payment for pickup
        .deliveryFee(BigDecimal.ZERO) // No delivery fee for pickup
        .deliveryInstructions(
            "Please collect your medication from the pharmacy during operating hours: 8:00 AM - 5:00 PM, Monday to Friday")
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

  @Override
  public void completeDelivery(MedicationDelivery delivery) {
    log.info("Completing pickup delivery: {}", delivery.getId());

    if (delivery.getStatus() != DeliveryStatus.PREPARING) {
      throw new AppException(
          "Pickup delivery must be in PREPARING status to complete, current: " + delivery.getStatus());
    }

    delivery.setPickupDate(Instant.now());
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
        delivery.getStatus() == DeliveryStatus.PAID;
  }

  @Override
  public int getStandardDeliveryDays() {
    return 0; // Immediate pickup availability
  }
}