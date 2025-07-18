package com.mytelmed.core.transcription.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * DTO representing a single transcription entry from GetStream JSONL format
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TranscriptionEntry {
    @JsonProperty("speaker_id")
    private String speakerId;

    private String type;
    private String text;

    @JsonProperty("start_ts")
    private Long startTs;

    @JsonProperty("stop_ts")
    private Long stopTs;
}