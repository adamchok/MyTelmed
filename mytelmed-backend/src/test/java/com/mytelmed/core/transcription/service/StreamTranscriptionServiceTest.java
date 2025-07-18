package com.mytelmed.core.transcription.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestTemplate;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StreamTranscriptionServiceTest {

    @Mock
    private RestTemplate restTemplate;

    private StreamTranscriptionService streamTranscriptionService;

    @BeforeEach
    void setUp() {
        streamTranscriptionService = new StreamTranscriptionService(restTemplate);
    }

    @Test
    void testDownloadAndProcessTranscription_Success() {
        // Given - Sample JSONL content from GetStream with real doctor/patient IDs
        String jsonlContent = """
                {"speaker_id":"3f2d57d4-be76-45c8-b9e2-7db3bbd015f4","type":"speech","text":"Hello, how are you feeling today?","start_ts":81752,"stop_ts":82592}
                {"speaker_id":"209f7e7c-6bb3-4074-bffd-9edceef8dda5","type":"speech","text":"I've been having some headaches.","start_ts":83013,"stop_ts":85013}
                {"speaker_id":"3f2d57d4-be76-45c8-b9e2-7db3bbd015f4","type":"speech","text":"Can you describe the pain?","start_ts":83032,"stop_ts":87032}
                {"speaker_id":"209f7e7c-6bb3-4074-bffd-9edceef8dda5","type":"speech","text":"It's a throbbing pain on the left side.","start_ts":92072,"stop_ts":94072}
                {"speaker_id":"3f2d57d4-be76-45c8-b9e2-7db3bbd015f4","type":"speech","text":"How long have you been experiencing this?","start_ts":94695,"stop_ts":97695}
                {"speaker_id":"209f7e7c-6bb3-4074-bffd-9edceef8dda5","type":"speech","text":"About a week now.","start_ts":100444,"stop_ts":102444}
                {"speaker_id":"3f2d57d4-be76-45c8-b9e2-7db3bbd015f4","type":"speech","text":"I recommend taking some pain medication and getting rest.","start_ts":101542,"stop_ts":106542}
                {"speaker_id":"209f7e7c-6bb3-4074-bffd-9edceef8dda5","type":"speech","text":"Thank you, doctor.","start_ts":111834,"stop_ts":113834}
                """;

        String transcriptionUrl = "https://test-url.com/transcription.jsonl";
        String doctorId = "3f2d57d4-be76-45c8-b9e2-7db3bbd015f4";
        String patientId = "209f7e7c-6bb3-4074-bffd-9edceef8dda5";

        // Mock RestTemplate response
        when(restTemplate.getForObject(eq(transcriptionUrl), eq(String.class)))
                .thenReturn(jsonlContent);

        // When
        String result = streamTranscriptionService.downloadAndProcessTranscription(transcriptionUrl, doctorId,
                patientId);

        // Then
        assertNotNull(result);
        assertTrue(result.contains("Doctor:"));
        assertTrue(result.contains("Patient:"));
        assertTrue(result.contains("how are you feeling"));
        assertTrue(result.contains("headaches"));
        assertTrue(result.contains("pain medication"));

        // Verify proper speaker identification
        assertTrue(result.contains("Doctor: Hello, how are you feeling today?"));
        assertTrue(result.contains("Patient: I've been having some headaches."));

        // Verify the transcription is properly formatted
        String[] lines = result.split("\n");
        assertTrue(lines.length >= 2); // Should have at least Doctor and Patient lines
    }

    @Test
    void testDownloadAndProcessTranscription_EmptyContent() {
        // Given
        String transcriptionUrl = "https://test-url.com/transcription.jsonl";
        String doctorId = "3f2d57d4-be76-45c8-b9e2-7db3bbd015f4";
        String patientId = "209f7e7c-6bb3-4074-bffd-9edceef8dda5";

        when(restTemplate.getForObject(eq(transcriptionUrl), eq(String.class)))
                .thenReturn("");

        // When
        String result = streamTranscriptionService.downloadAndProcessTranscription(transcriptionUrl, doctorId,
                patientId);

        // Then
        assertNull(result);
    }

    @Test
    void testDownloadAndProcessTranscription_RestTemplateException() {
        // Given
        String transcriptionUrl = "https://test-url.com/transcription.jsonl";
        String doctorId = "3f2d57d4-be76-45c8-b9e2-7db3bbd015f4";
        String patientId = "209f7e7c-6bb3-4074-bffd-9edceef8dda5";

        when(restTemplate.getForObject(eq(transcriptionUrl), eq(String.class)))
                .thenThrow(new RuntimeException("Network error"));

        // When
        String result = streamTranscriptionService.downloadAndProcessTranscription(transcriptionUrl, doctorId,
                patientId);

        // Then
        assertNull(result);
    }

    @Test
    void testDownloadAndProcessTranscription_UnknownSpeaker() {
        // Given - JSONL with unknown speaker ID
        String jsonlContent = """
                {"speaker_id":"3f2d57d4-be76-45c8-b9e2-7db3bbd015f4","type":"speech","text":"Hello patient","start_ts":1000,"stop_ts":2000}
                {"speaker_id":"unknown-789","type":"speech","text":"Unknown speaker","start_ts":3000,"stop_ts":4000}
                {"speaker_id":"209f7e7c-6bb3-4074-bffd-9edceef8dda5","type":"speech","text":"Hello doctor","start_ts":5000,"stop_ts":6000}
                """;

        String transcriptionUrl = "https://test-url.com/transcription.jsonl";
        String doctorId = "3f2d57d4-be76-45c8-b9e2-7db3bbd015f4";
        String patientId = "209f7e7c-6bb3-4074-bffd-9edceef8dda5";

        when(restTemplate.getForObject(eq(transcriptionUrl), eq(String.class)))
                .thenReturn(jsonlContent);

        // When
        String result = streamTranscriptionService.downloadAndProcessTranscription(transcriptionUrl, doctorId,
                patientId);

        // Then
        assertNotNull(result);
        assertTrue(result.contains("Doctor: Hello patient"));
        assertTrue(result.contains("Patient: Hello doctor"));
        assertTrue(result.contains("Unknown Speaker: Unknown speaker"));
    }

    @Test
    void testDownloadAndProcessTranscription_InvalidJsonl() {
        // Given
        String invalidJsonlContent = """
                {"invalid": "json"}
                not valid json at all
                {"speaker_id":"3f2d57d4-be76-45c8-b9e2-7db3bbd015f4","type":"speech","text":"Valid entry","start_ts":1000,"stop_ts":2000}
                """;

        String transcriptionUrl = "https://test-url.com/transcription.jsonl";
        String doctorId = "3f2d57d4-be76-45c8-b9e2-7db3bbd015f4";
        String patientId = "209f7e7c-6bb3-4074-bffd-9edceef8dda5";

        when(restTemplate.getForObject(eq(transcriptionUrl), eq(String.class)))
                .thenReturn(invalidJsonlContent);

        // When
        String result = streamTranscriptionService.downloadAndProcessTranscription(transcriptionUrl, doctorId,
                patientId);

        // Then
        // Should still work with at least one valid entry
        assertNotNull(result);
        assertTrue(result.contains("Doctor: Valid entry"));
    }
}