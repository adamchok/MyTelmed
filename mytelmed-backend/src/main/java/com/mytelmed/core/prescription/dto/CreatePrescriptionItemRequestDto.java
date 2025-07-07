package com.mytelmed.core.prescription.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;


public record CreatePrescriptionItemRequestDto(
        @NotBlank(message = "Medication name is required")
        String medicationName,

        String genericName,

        @NotBlank(message = "Dosage form is required")
        String dosageForm,

        @NotBlank(message = "Strength is required")
        String strength,

        @NotNull(message = "Quantity is required")
        Integer quantity,

        @NotBlank(message = "Instructions are required")
        String instructions,

        @NotBlank(message = "Frequency is required")
        String frequency,

        @NotBlank(message = "Duration is required")
        String duration,

        String notes
) {
}
