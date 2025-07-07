package com.mytelmed.core.pharmacist.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;


public record UpdatePharmacistFacilityRequestDto(
        @NotNull(message = "Facility ID is required")
        UUID facilityId
) {
}
