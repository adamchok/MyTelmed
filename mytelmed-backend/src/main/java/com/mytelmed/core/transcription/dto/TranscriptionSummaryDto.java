package com.mytelmed.core.transcription.dto;

import lombok.Builder;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * DTO for transcription summary response
 */
@Builder
public record TranscriptionSummaryDto(
                UUID appointmentId,
                String patientSummary,
                String doctorSummary,
                List<String> keyPoints,
                List<String> actionItems,
                String processingStatus,
                String aiModel,
                Instant createdAt,
                Instant updatedAt,
                String errorMessage) {
}
