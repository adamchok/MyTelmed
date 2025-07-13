package com.mytelmed.core.appointment.dto;

import com.mytelmed.common.constant.appointment.ConsultationMode;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.UUID;


/**
 * Request DTO for booking appointments in Malaysian public healthcare
 * telemedicine.
 * Supports both PHYSICAL and VIRTUAL consultation modes.
 */
public record BookAppointmentRequestDto(
        @NotNull(message = "Doctor ID is required") UUID doctorId,

        @NotNull(message = "Patient ID is required") UUID patientId,

        @NotNull(message = "Time slot ID is required") UUID timeSlotId,

        @NotNull(message = "Consultation mode is required") ConsultationMode consultationMode,

        @Size(max = 1000, message = "Patient notes cannot exceed 1000 characters") String patientNotes,

        @Size(max = 500, message = "Reason for visit cannot exceed 500 characters") String reasonForVisit,

        List<AddAppointmentDocumentRequestDto> documentRequestList) {
}
