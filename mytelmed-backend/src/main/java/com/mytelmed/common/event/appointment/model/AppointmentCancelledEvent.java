package com.mytelmed.common.event.appointment.model;

import com.mytelmed.core.doctor.entity.Doctor;
import com.mytelmed.core.patient.entity.Patient;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import java.time.LocalDateTime;
import java.util.UUID;


@Builder
public record AppointmentCancelledEvent(
        @NotNull(message = "Appointment ID is required")
        UUID appointmentId,

        @NotNull(message = "Patient is required")
        Patient patient,

        @NotNull(message = "Doctor is required")
        Doctor doctor,

        @NotNull(message = "Appointment date time is required")
        LocalDateTime appointmentDateTime,

        String reasonForVisit,

        String cancellationReason
) {
}
