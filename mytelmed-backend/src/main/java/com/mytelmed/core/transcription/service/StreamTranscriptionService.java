package com.mytelmed.core.transcription.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mytelmed.core.transcription.dto.TranscriptionEntry;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.List;

/**
 * Service for downloading and processing GetStream transcription data
 */
@Slf4j
@Service
public class StreamTranscriptionService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public StreamTranscriptionService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Download and process transcription from GetStream URL
     * 
     * @param transcriptionUrl The URL to download transcription from
     * @param doctorId         The doctor's account ID
     * @param patientId        The patient's account ID
     * @return Formatted transcription text
     */
    public String downloadAndProcessTranscription(String transcriptionUrl, String doctorId, String patientId) {
        try {
            log.info("Downloading transcription from URL: {}", transcriptionUrl);

            // Download the JSONL content
            String jsonlContent = restTemplate.getForObject(transcriptionUrl, String.class);

            if (jsonlContent == null || jsonlContent.trim().isEmpty()) {
                log.warn("Empty transcription content received from URL: {}", transcriptionUrl);
                return null;
            }

            log.debug("Downloaded transcription content, length: {} characters", jsonlContent.length());

            // Parse and format the transcription
            String formattedTranscription = parseJsonlTranscription(jsonlContent, doctorId, patientId);

            if (formattedTranscription != null) {
                log.info("Successfully processed transcription, final length: {} characters",
                        formattedTranscription.length());
            }

            return formattedTranscription;
        } catch (Exception e) {
            log.error("Error downloading transcription from URL: {}", transcriptionUrl, e);
            return null;
        }
    }

    /**
     * Parse JSONL format transcription and convert to readable text
     * 
     * @param jsonlContent The JSONL content from GetStream
     * @param doctorId     The doctor's account ID
     * @param patientId    The patient's account ID
     * @return Formatted transcription text
     */
    private String parseJsonlTranscription(String jsonlContent, String doctorId, String patientId) {
        List<TranscriptionEntry> entries = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(new StringReader(jsonlContent))) {
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.trim().isEmpty())
                    continue;

                try {
                    TranscriptionEntry entry = objectMapper.readValue(line, TranscriptionEntry.class);
                    if ("speech".equals(entry.getType()) && entry.getText() != null
                            && !entry.getText().trim().isEmpty()) {
                        entries.add(entry);
                    }
                } catch (Exception e) {
                    log.warn("Failed to parse transcription line: {}", line, e);
                }
            }
        } catch (IOException e) {
            log.error("Error reading transcription content", e);
            return null;
        }

        if (entries.isEmpty()) {
            log.warn("No valid transcription entries found");
            return null;
        }

        log.debug("Found {} valid transcription entries", entries.size());

        // Sort entries by start timestamp
        entries.sort((a, b) -> Long.compare(a.getStartTs(), b.getStartTs()));

        // Format the transcription
        return formatTranscription(entries, doctorId, patientId);
    }

    /**
     * Format transcription entries into readable text with speaker identification
     * 
     * @param entries   List of transcription entries
     * @param doctorId  The doctor's account ID
     * @param patientId The patient's account ID
     * @return Formatted transcription text
     */
    private String formatTranscription(List<TranscriptionEntry> entries, String doctorId, String patientId) {
        if (entries.isEmpty()) {
            return null;
        }

        StringBuilder transcription = new StringBuilder();

        String currentSpeaker = null;
        StringBuilder currentSpeakerText = new StringBuilder();

        for (TranscriptionEntry entry : entries) {
            String speakerLabel = getSpeakerLabel(entry.getSpeakerId(), doctorId, patientId);

            if (!speakerLabel.equals(currentSpeaker)) {
                // New speaker, flush previous speaker's text
                if (currentSpeaker != null && currentSpeakerText.length() > 0) {
                    transcription.append(currentSpeaker).append(": ")
                            .append(currentSpeakerText.toString().trim())
                            .append("\n");
                }

                currentSpeaker = speakerLabel;
                currentSpeakerText = new StringBuilder();
            }

            // Add text to current speaker's content
            currentSpeakerText.append(entry.getText()).append(" ");
        }

        // Flush the last speaker's text
        if (currentSpeaker != null && currentSpeakerText.length() > 0) {
            transcription.append(currentSpeaker).append(": ")
                    .append(currentSpeakerText.toString().trim())
                    .append("\n");
        }

        return transcription.toString().trim();
    }

    /**
     * Get speaker label based on speaker ID
     * 
     * @param speakerId The speaker ID from GetStream
     * @param doctorId  The doctor's account ID
     * @param patientId The patient's account ID
     * @return Speaker label (Doctor/Patient/Unknown)
     */
    private String getSpeakerLabel(String speakerId, String doctorId, String patientId) {
        if (speakerId.equals(doctorId)) {
            return "Doctor";
        } else if (speakerId.equals(patientId)) {
            return "Patient";
        } else {
            log.warn("Unknown speaker ID: {} (Doctor: {}, Patient: {})", speakerId, doctorId, patientId);
            return "Unknown Speaker";
        }
    }
}