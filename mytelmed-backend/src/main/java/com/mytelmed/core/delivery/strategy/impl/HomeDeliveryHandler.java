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
import java.time.temporal.ChronoUnit;

/**
 * Home delivery handler for Malaysian public healthcare telemedicine.
 * Handles courier delivery workflow with standard 1-3 business days delivery
 * timeline.
 */
@Slf4j
@Component
public class HomeDeliveryHandler implements DeliveryHandler {

  private static final BigDecimal STANDARD_DELIVERY_FEE = new BigDecimal("10.00"); // RM 10 standardized delivery fee
                                                                                   // (Malaysian public healthcare)
  private static final int STANDARD_DELIVERY_DAYS = 2; // 2 business days standard

  @Override
  public DeliveryMethod getSupportedDeliveryMethod() {
    return DeliveryMethod.HOME_DELIVERY;
  }

  @Override
  public MedicationDelivery initializeDelivery(Prescription prescription) {
    log.info("Initializing home delivery for prescription: {}", prescription.getId());

    MedicationDelivery delivery = MedicationDelivery.builder()
        .prescription(prescription)
        .deliveryMethod(DeliveryMethod.HOME_DELIVERY)
        .status(DeliveryStatus.PENDING_PAYMENT)
        .deliveryFee(STANDARD_DELIVERY_FEE)
        .deliveryInstructions(
            "Standard home delivery via courier service. Please ensure someone is available to receive the medication.")
        .build();

    delivery.calculateEstimatedDeliveryDate();
    return delivery;
  }

  @Override
  public void processDelivery(MedicationDelivery delivery) {
    log.info("Processing home delivery: {}", delivery.getId());

    if (!canProcess(delivery)) {
      throw new AppException("Home delivery cannot be processed in current status: " + delivery.getStatus());
    }

    delivery.setStatus(DeliveryStatus.PREPARING);
    log.info("Home delivery {} moved to PREPARING status", delivery.getId());
  }

  @Override
  public void completeDelivery(MedicationDelivery delivery) {
    log.info("Completing home delivery: {}", delivery.getId());

    if (delivery.getStatus() != DeliveryStatus.OUT_FOR_DELIVERY) {
      throw new AppException("Home delivery must be OUT_FOR_DELIVERY to complete, current: " + delivery.getStatus());
    }

    delivery.setActualDeliveryDate(Instant.now());
    delivery.setStatus(DeliveryStatus.DELIVERED);
    delivery.setDeliveryNotes("Medication successfully delivered to patient's address");

    log.info("Home delivery {} completed successfully", delivery.getId());
  }

  @Override
  public void cancelDelivery(MedicationDelivery delivery, String reason) {
    log.info("Cancelling home delivery: {} with reason: {}", delivery.getId(), reason);

    delivery.setStatus(DeliveryStatus.CANCELLED);
    delivery.setCancellationReason(reason);

    log.info("Home delivery {} cancelled", delivery.getId());
  }

  @Override
  public BigDecimal calculateDeliveryFee(MedicationDelivery delivery) {
    // Could be enhanced with distance-based calculation or address zone pricing
    return STANDARD_DELIVERY_FEE;
  }

  @Override
  public boolean canProcess(MedicationDelivery delivery) {
    return delivery.getDeliveryMethod() == DeliveryMethod.HOME_DELIVERY &&
        delivery.getStatus() == DeliveryStatus.PAID &&
        delivery.getDeliveryAddress() != null;
  }

  @Override
  public int getStandardDeliveryDays() {
    return STANDARD_DELIVERY_DAYS;
  }

  /**
   * Marks delivery as out for delivery with courier details
   */
  public void markOutForDelivery(MedicationDelivery delivery, String courierName, String trackingReference,
      String contactPhone) {
    log.info("Marking home delivery {} as out for delivery", delivery.getId());

    if (delivery.getStatus() != DeliveryStatus.PREPARING) {
      throw new AppException(
          "Home delivery must be in PREPARING status to mark out for delivery, current: " + delivery.getStatus());
    }

    delivery.setStatus(DeliveryStatus.OUT_FOR_DELIVERY);
    delivery.setCourierName(courierName);
    delivery.setTrackingReference(trackingReference);
    delivery.setDeliveryContactPhone(contactPhone);

    log.info("Home delivery {} marked as out for delivery with courier: {}", delivery.getId(), courierName);
  }
}