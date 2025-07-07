package com.mytelmed.common.event.appointment.model;

import com.mytelmed.core.patient.entity.Patient;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Builder;
import java.time.LocalDateTime;
import java.util.UUID;


@Builder
public record UpcomingAppointmentReminderEvent(
        @NotNull(message = "Appointment ID is required")
        UUID appointmentId,

        @NotNull(message = "Patient is required")
        Patient patient,

        @NotNull(message = "Provider account ID is required")
        UUID providerAccountId,
        
        @NotBlank(message = "Provider name is required")
        String providerName,

        @Email @NotBlank(message = "Provider email is required")
        String providerEmail,

        @NotNull
        LocalDateTime appointmentDateTime,

        String reasonForVisit,

        @NotNull
        @Positive
        long hoursUntilAppointment
) {
}
