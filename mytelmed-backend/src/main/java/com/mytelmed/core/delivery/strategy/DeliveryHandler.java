package com.mytelmed.core.delivery.strategy;

import com.mytelmed.common.constant.delivery.DeliveryMethod;
import com.mytelmed.core.delivery.entity.MedicationDelivery;
import com.mytelmed.core.prescription.entity.Prescription;
import java.math.BigDecimal;

/**
 * Strategy interface for handling different delivery methods in Malaysian
 * public healthcare telemedicine.
 * Implements Strategy Pattern for delivery method handling.
 */
public interface DeliveryHandler {
    /**
     * Returns the delivery method this handler supports
     */
    DeliveryMethod getSupportedDeliveryMethod();

    /**
     * Initializes delivery for the given prescription and method
     */
    MedicationDelivery initializeDelivery(Prescription prescription);

    /**
     * Processes the delivery (marks as preparing, out for delivery, etc.)
     */
    void processDelivery(MedicationDelivery delivery);

    /**
     * Completes the delivery (marks as delivered or picked up)
     */
    void completeDelivery(MedicationDelivery delivery);

    /**
     * Cancels the delivery
     */
    void cancelDelivery(MedicationDelivery delivery, String reason);

    /**
     * Calculates delivery fee for this method
     */
    BigDecimal calculateDeliveryFee(MedicationDelivery delivery);

    /**
     * Validates if delivery can be processed
     */
    boolean canProcess(MedicationDelivery delivery);
}
