package com.mytelmed.core.appointment.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;


public record RescheduleAppointmentRequestDto(
        @NotNull(message = "New time slot ID is required")
        UUID newTimeSlotId,

        String reason
) {
}