package com.mytelmed.core.appointment.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.UUID;


public record BookAppointmentRequestDto(
        @NotNull(message = "Doctor ID is required") UUID doctorId,

        @NotNull(message = "Time slot ID is required") UUID timeSlotId,

        @Size(max = 1000, message = "Patient notes cannot exceed 1000 characters") String patientNotes,

        @Size(max = 500, message = "Reason for visit cannot exceed 500 characters") String reasonForVisit,

        List<AddAppointmentDocumentRequestDto> documentRequestList
) {
}
