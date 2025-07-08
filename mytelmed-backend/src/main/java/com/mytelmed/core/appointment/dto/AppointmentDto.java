package com.mytelmed.core.appointment.dto;

import com.mytelmed.common.constant.appointment.ConsultationMode;
import com.mytelmed.core.doctor.dto.DoctorDto;
import com.mytelmed.core.patient.dto.PatientDto;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for appointment data in Malaysian public healthcare telemedicine.
 * Includes consultation mode to distinguish between PHYSICAL and VIRTUAL
 * appointments.
 */
public record AppointmentDto(
    String id,
    PatientDto patient,
    DoctorDto doctor,
    LocalDateTime appointmentDateTime,
    Integer durationMinutes,
    String status,
    ConsultationMode consultationMode,
    String patientNotes,
    String doctorNotes,
    String reasonForVisit,
    String cancellationReason,
    Instant completedAt,
    List<AppointmentDocumentDto> attachedDocuments,
    Instant createdAt,
    Instant updatedAt) {
}
