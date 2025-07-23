package com.mytelmed.common.constant.transcription;

/**
 * Constants for transcription processing status
 */
public enum TranscriptProcessingStatus {
    PENDING("pending"),
    PROCESSING("processing"),
    COMPLETED("completed"),
    FAILED("failed");

    private final String status;

    TranscriptProcessingStatus(String status) {
        this.status = status;
    }

    public String getStatus() {
        return status;
    }

    @Override
    public String toString() {
        return status;
    }
}
