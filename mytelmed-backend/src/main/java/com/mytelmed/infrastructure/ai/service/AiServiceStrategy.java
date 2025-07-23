package com.mytelmed.infrastructure.ai.service;

import com.mytelmed.infrastructure.ai.dto.TranscriptionSummaryRequest;
import com.mytelmed.infrastructure.ai.dto.TranscriptionSummaryResponse;

/**
 * Interface for AI service to generate transcription summaries
 */
public interface AiServiceStrategy {

    /**
     * Generate summary from video call transcription
     * 
     * @param request the transcription summary request
     * @return the generated summary response
     */
    TranscriptionSummaryResponse generateTranscriptionSummary(TranscriptionSummaryRequest request);

    /**
     * Get the AI model identifier
     * 
     * @return the model identifier
     */
    String getModelIdentifier();
}