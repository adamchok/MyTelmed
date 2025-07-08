package com.mytelmed.core.timeslot.dto;

import com.mytelmed.common.constant.appointment.ConsultationMode;
import java.time.LocalDateTime;

/**
 * DTO for time slot data in Malaysian public healthcare telemedicine.
 * Includes consultation mode to show what type of appointments the slot
 * supports.
 */
public record TimeSlotDto(
                String id,
                String doctorId,
                LocalDateTime startTime,
                LocalDateTime endTime,
                Integer durationMinutes,
                ConsultationMode consultationMode,
                Boolean isAvailable,
                Boolean isBooked) {
}
