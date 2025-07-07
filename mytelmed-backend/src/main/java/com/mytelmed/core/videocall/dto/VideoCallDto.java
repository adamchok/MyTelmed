package com.mytelmed.core.videocall.dto;

import java.time.Instant;


public record VideoCallDto(
        String id,
        String appointmentId,
        String streamCallId,
        String streamCallType,
        String patientToken,
        String providerToken,
        Instant meetingStartedAt,
        Instant meetingEndedAt,
        Instant patientJoinedAt,
        Instant providerJoinedAt,
        Instant patientLeftAt,
        Instant providerLeftAt,
        Boolean isActive,
        Instant createdAt,
        Instant updatedAt
) {
}
