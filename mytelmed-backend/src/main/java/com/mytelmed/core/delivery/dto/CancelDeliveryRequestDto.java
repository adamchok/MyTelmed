package com.mytelmed.core.delivery.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

/**
 * Request DTO for cancelling a delivery.
 */
public record CancelDeliveryRequestDto(
    @NotNull(message = "Delivery ID is required") UUID deliveryId,

    @NotBlank(message = "Cancellation reason is required") String reason) {
}