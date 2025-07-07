package com.mytelmed.core.prescription.dto;

public record PrescriptionItemDto(
        String id,
        String medicationName,
        String genericName,
        String dosageForm,
        String strength,
        Integer quantity,
        String instructions,
        String frequency,
        String duration,
        String notes,
        Boolean isSubstituted,
        String substitutionReason
) {
}
