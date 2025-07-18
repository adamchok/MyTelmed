package com.mytelmed.core.transcription.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.Instant;

/**
 * DTO representing the GetStream transcription webhook payload
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StreamTranscriptionPayload {
    private String type;

    @JsonProperty("created_at")
    private Instant createdAt;

    @JsonProperty("call_cid")
    private String callCid;

    @JsonProperty("call_transcription")
    private CallTranscription callTranscription;

    @JsonProperty("egress_id")
    private String egressId;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CallTranscription {
        private String filename;
        private String url;

        @JsonProperty("start_time")
        private Instant startTime;

        @JsonProperty("end_time")
        private Instant endTime;

        @JsonProperty("session_id")
        private String sessionId;
    }
}
