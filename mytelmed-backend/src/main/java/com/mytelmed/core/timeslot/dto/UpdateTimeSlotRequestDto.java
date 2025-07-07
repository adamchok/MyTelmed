package com.mytelmed.core.timeslot.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;


public record UpdateTimeSlotRequestDto(
        @NotNull(message = "Start time is required")
        @Future(message = "Start time must be in the future")
        LocalDateTime startTime,

        @NotNull(message = "End time is required")
        @Future(message = "End time must be in the future")
        LocalDateTime endTime,

        @NotNull(message = "Duration is required")
        @Min(value = 15, message = "Duration must be at least 15 minutes")
        @Max(value = 180, message = "Duration cannot exceed 180 minutes")
        Integer durationMinutes
) {
}
