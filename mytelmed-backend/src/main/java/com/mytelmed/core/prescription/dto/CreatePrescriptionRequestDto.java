package com.mytelmed.core.prescription.dto;

import com.mytelmed.common.constant.prescription.DeliveryType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.UUID;


public record CreatePrescriptionRequestDto(
        @NotNull(message = "Appointment ID is required")
        UUID appointmentId,

        @NotBlank(message = "Diagnosis is required")
        @Size(max = 1000, message = "Diagnosis cannot exceed 1000 characters")
        String diagnosis,

        @Size(max = 1000, message = "Notes cannot exceed 1000 characters")
        String notes,

        @NotBlank(message = "Instructions are required")
        @Size(max = 1000, message = "Instructions cannot exceed 1000 characters")
        String instructions,

        @NotNull(message = "Delivery type is required")
        DeliveryType deliveryType,

        @NotNull(message = "Prescription items are required")
        @Size(min = 1, message = "At least one prescription item is required")
        List<CreatePrescriptionItemRequestDto> prescriptionItems
) {
}
