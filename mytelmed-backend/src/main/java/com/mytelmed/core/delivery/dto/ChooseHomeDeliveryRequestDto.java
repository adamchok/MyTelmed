package com.mytelmed.core.delivery.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

/**
 * Request DTO for patient choosing home delivery method.
 */
public record ChooseHomeDeliveryRequestDto(
    @NotNull(message = "Prescription ID is required") UUID prescriptionId,

    @NotNull(message = "Delivery address ID is required") UUID addressId,

    String deliveryInstructions) {
}