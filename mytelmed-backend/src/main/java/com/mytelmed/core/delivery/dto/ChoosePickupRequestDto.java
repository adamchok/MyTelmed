package com.mytelmed.core.delivery.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

/**
 * Request DTO for patient choosing pickup delivery method.
 */
public record ChoosePickupRequestDto(
    @NotNull(message = "Prescription ID is required") UUID prescriptionId) {
}