package com.mytelmed.core.delivery.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

/**
 * Request DTO for pharmacist marking delivery as out for delivery.
 */
public record MarkOutForDeliveryRequestDto(
    @NotNull(message = "Delivery ID is required")
    UUID deliveryId,

    @NotBlank(message = "Courier name is required")
    String courierName,

    @NotBlank(message = "Tracking reference is required")
    String trackingReference,

    String contactPhone
) {
}