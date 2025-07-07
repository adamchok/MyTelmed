package com.mytelmed.core.appointment.dto;

import com.mytelmed.core.doctor.dto.DoctorDto;
import com.mytelmed.core.patient.dto.PatientDto;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;


public record AppointmentDto(
        String id,
        PatientDto patient,
        DoctorDto doctor,
        LocalDateTime appointmentDateTime,
        Integer durationMinutes,
        String status,
        String patientNotes,
        String doctorNotes,
        String reasonForVisit,
        String cancellationReason,
        Instant completedAt,
        List<AppointmentDocumentDto> attachedDocuments,
        Instant createdAt,
        Instant updatedAt
) {
}
