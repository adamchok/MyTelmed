package com.mytelmed.core.pharmacist.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.UUID;


public record UpdatePharmacistFacilityRequestDto(
        @NotBlank(message = "Facility ID is required")
        UUID facilityId
) {
}
