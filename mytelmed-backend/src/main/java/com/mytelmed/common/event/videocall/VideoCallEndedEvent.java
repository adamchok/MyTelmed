package com.mytelmed.common.event.videocall;

import java.util.UUID;

/**
 * Event fired when a video call ends
 */
public record VideoCallEndedEvent(
        UUID appointmentId,
        String transcriptionText,
        String callDuration,
        boolean hasTranscription) {
}