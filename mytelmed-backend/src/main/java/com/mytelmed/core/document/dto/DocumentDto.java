package com.mytelmed.core.document.dto;

import com.mytelmed.core.patient.dto.PatientDto;


public record DocumentDto(
        String id,
        String documentName,
        String documentType,
        String documentSize,
        String documentUrl,
        DocumentAccessDto documentAccess,
        PatientDto patient,
        String createdAt,
        String updatedAt
) {
}
