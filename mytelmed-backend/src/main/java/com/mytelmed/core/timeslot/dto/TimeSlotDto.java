package com.mytelmed.core.timeslot.dto;

import java.time.LocalDateTime;


public record TimeSlotDto(
        String id,
        String doctorId,
        LocalDateTime startTime,
        LocalDateTime endTime,
        Integer durationMinutes,
        Boolean isAvailable,
        Boolean isBooked
) {
}
