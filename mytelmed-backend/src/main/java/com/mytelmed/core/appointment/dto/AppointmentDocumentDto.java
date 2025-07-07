package com.mytelmed.core.appointment.dto;

import com.mytelmed.common.constant.file.DocumentType;
import java.time.Instant;


public record AppointmentDocumentDto(
        String id,
        String documentId,
        String documentName,
        DocumentType documentType,
        String documentUrl,
        String documentSize,
        String notes,
        Instant createdAt
) {
}