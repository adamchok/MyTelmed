package com.mytelmed.model.dto;

import java.time.Instant;
import java.util.List;


public record AppointmentDto(
    String id,
    DoctorDto doctor,
    Instant appointmentDateTime,
    int duration,
    String status,
    String mode,
    PatientDto patient,
    // TODO: List of Symptoms.
    String reason,
    List<DocumentDto> documents,
    String notes,
    Instant createdAt,
    Instant updatedAt
) {}