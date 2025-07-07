package com.mytelmed.common.event.prescription.model;

import com.mytelmed.core.prescription.entity.Prescription;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;


@Builder
public record PrescriptionOutForDeliveryEvent(
        @NotNull(message = "Prescription is required")
        Prescription prescription
) {
}
