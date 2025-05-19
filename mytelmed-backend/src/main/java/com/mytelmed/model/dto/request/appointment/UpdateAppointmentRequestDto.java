package com.mytelmed.model.dto.request.appointment;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;


public record UpdateAppointmentRequestDto(
        @NotNull @Future LocalDateTime appointmentDateTime,
        @NotNull String mode,
        @Size(max = 300) String reason,
        @Size(max = 300) String notes
) {}
