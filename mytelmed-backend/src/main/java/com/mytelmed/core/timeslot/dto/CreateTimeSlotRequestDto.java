package com.mytelmed.core.timeslot.dto;

import com.mytelmed.common.constant.appointment.ConsultationMode;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

/**
 * Request DTO for creating time slots in Malaysian public healthcare
 * telemedicine.
 * Allows doctors to specify consultation mode (PHYSICAL or VIRTUAL) for each
 * time slot.
 */
public record CreateTimeSlotRequestDto(
                @NotNull(message = "Start time is required") @Future(message = "Start time must be in the future") LocalDateTime startTime,

                @NotNull(message = "End time is required") @Future(message = "End time must be in the future") LocalDateTime endTime,

                @NotNull(message = "Duration is required") @Min(value = 15, message = "Duration must be at least 15 minutes") @Max(value = 180, message = "Duration cannot exceed 180 minutes") Integer durationMinutes,

                @NotNull(message = "Consultation mode is required") ConsultationMode consultationMode) {
}
