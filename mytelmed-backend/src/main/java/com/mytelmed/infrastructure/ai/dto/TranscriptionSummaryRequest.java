package com.mytelmed.infrastructure.ai.dto;

import lombok.Builder;

import java.util.UUID;

/**
 * DTO for transcription summary request to AI service
 */
@Builder
public record TranscriptionSummaryRequest(
        UUID appointmentId,
        String transcriptionText,
        String patientName,
        String doctorName,
        String appointmentType,
        String reasonForVisit) {
}