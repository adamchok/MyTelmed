package com.mytelmed.core.prescription.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;


public record ChoosePrescriptionDeliveryRequestDto(
        @NotNull
        UUID addressId
) {
}
