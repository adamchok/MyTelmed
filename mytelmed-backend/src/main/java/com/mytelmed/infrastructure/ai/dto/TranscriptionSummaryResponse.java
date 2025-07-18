package com.mytelmed.infrastructure.ai.dto;

import lombok.Builder;

import java.util.List;

/**
 * DTO for transcription summary response from AI service
 */
@Builder
public record TranscriptionSummaryResponse(
        String patientSummary,
        String doctorSummary,
        List<String> keyPoints,
        List<String> actionItems,
        boolean success,
        String errorMessage) {
}