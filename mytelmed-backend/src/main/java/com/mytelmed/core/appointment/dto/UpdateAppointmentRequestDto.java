package com.mytelmed.core.appointment.dto;

import jakarta.validation.constraints.Size;
import java.util.List;


public record UpdateAppointmentRequestDto(
        @Size(max = 1000, message = "Patient notes cannot exceed 1000 characters")
        String patientNotes,

        @Size(max = 1000, message = "Nutritionist notes cannot exceed 1000 characters")
        String nutritionistNotes,

        @Size(max = 500, message = "Reason for visit cannot exceed 500 characters")
        String reasonForVisit,

        List<AddAppointmentDocumentRequestDto> documentRequestList
) {
}