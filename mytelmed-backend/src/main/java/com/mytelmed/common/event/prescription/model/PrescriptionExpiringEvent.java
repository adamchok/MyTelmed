package com.mytelmed.common.event.prescription.model;

import com.mytelmed.core.prescription.entity.Prescription;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;


@Builder
public record PrescriptionExpiringEvent(
        @NotNull(message = "Prescription is required")
        Prescription prescription,

        @NotNull(message = "Days until expiry is required")
        Integer daysUntilExpiry
) {
}
