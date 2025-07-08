package com.mytelmed.common.event.appointment.model;

import com.mytelmed.common.constant.appointment.ConsultationMode;
import com.mytelmed.core.doctor.entity.Doctor;
import com.mytelmed.core.patient.entity.Patient;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Event published to send appointment reminders in Malaysian public healthcare
 * telemedicine.
 * Supports both 24-hour and 1-hour reminders for virtual and physical
 * appointments.
 */
@Builder
public record AppointmentReminderEvent(
    @NotNull(message = "Appointment ID is required") UUID appointmentId,

    @NotNull(message = "Patient is required") Patient patient,

    @NotNull(message = "Doctor is required") Doctor doctor,

    @NotNull(message = "Appointment date time is required") LocalDateTime appointmentDateTime,

    @NotNull(message = "Consultation mode is required") ConsultationMode consultationMode,

    @NotBlank(message = "Hours till appointment is required") long hoursUntilAppointment,

    String reasonForVisit) {
}