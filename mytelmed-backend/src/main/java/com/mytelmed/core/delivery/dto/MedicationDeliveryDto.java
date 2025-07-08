package com.mytelmed.core.delivery.dto;

import com.mytelmed.common.constant.delivery.DeliveryMethod;
import com.mytelmed.common.constant.delivery.DeliveryStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * DTO for medication delivery information in Malaysian public healthcare
 * telemedicine.
 */
public record MedicationDeliveryDto(
    UUID id,
    UUID prescriptionId,
    DeliveryMethod deliveryMethod,
    DeliveryStatus status,
    String deliveryInstructions,
    BigDecimal deliveryFee,
    Instant estimatedDeliveryDate,
    Instant actualDeliveryDate,
    Instant pickupDate,
    String trackingReference,
    String courierName,
    String deliveryContactPhone,
    String deliveryNotes,
    String cancellationReason,
    Instant createdAt,
    Instant updatedAt) {
}