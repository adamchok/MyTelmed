package com.mytelmed.core.prescription.dto;

import com.mytelmed.common.constant.prescription.PrescriptionStatus;
import jakarta.validation.constraints.NotNull;


public record UpdatePrescriptionStatusRequest(
        @NotNull(message = "Status is required")
        PrescriptionStatus status
) {
}
