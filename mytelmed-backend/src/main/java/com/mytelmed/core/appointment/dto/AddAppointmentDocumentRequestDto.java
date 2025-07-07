package com.mytelmed.core.appointment.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.UUID;


public record AddAppointmentDocumentRequestDto(
        @NotNull(message = "Document ID is required")
        UUID documentId,
        
        @Size(max = 500, message = "Document notes cannot exceed 500 characters")
        String notes
) {
}
