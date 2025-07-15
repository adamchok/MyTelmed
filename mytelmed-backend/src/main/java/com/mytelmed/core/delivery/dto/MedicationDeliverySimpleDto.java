package com.mytelmed.core.delivery.dto;

import com.mytelmed.common.constant.delivery.DeliveryMethod;
import com.mytelmed.common.constant.delivery.DeliveryStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Simple DTO for medication delivery information without prescription details
 * to avoid circular dependency when including delivery info in PrescriptionDto.
 */
public record MedicationDeliverySimpleDto(
        UUID id,
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