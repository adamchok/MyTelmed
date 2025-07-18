package com.mytelmed.infrastructure.ai.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.mytelmed.infrastructure.ai.dto.TranscriptionSummaryRequest;
import com.mytelmed.infrastructure.ai.dto.TranscriptionSummaryResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.SdkBytes;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.bedrockruntime.BedrockRuntimeClient;
import software.amazon.awssdk.services.bedrockruntime.model.InvokeModelRequest;
import software.amazon.awssdk.services.bedrockruntime.model.InvokeModelResponse;
import java.util.ArrayList;
import java.util.List;

/**
 * AWS Bedrock implementation of AI service for transcription summarization
 * using Amazon Nova Micro
 */
@Slf4j
@Service
public class BedrockAiService implements AiService {
    private final BedrockRuntimeClient bedrockClient;
    private final ObjectMapper objectMapper;
    private final String modelId;

    public BedrockAiService(@Value("${aws.accessKey}") String accessKey,
            @Value("${aws.secretKey}") String secretKey,
            @Value("${aws.region}") String region,
            @Value("${ai.bedrock.model-id}") String modelId) {
        this.modelId = modelId;
        this.objectMapper = new ObjectMapper();

        AwsBasicCredentials credentials = AwsBasicCredentials.create(accessKey, secretKey);
        this.bedrockClient = BedrockRuntimeClient.builder()
                .credentialsProvider(StaticCredentialsProvider.create(credentials))
                .region(Region.of(region))
                .build();
    }

    @Override
    public TranscriptionSummaryResponse generateTranscriptionSummary(TranscriptionSummaryRequest request) {
        try {
            log.info("Generating transcription summary for appointment: {}", request.appointmentId());

            String prompt = buildPrompt(request);
            String requestBody = buildNovaRequest(prompt);

            InvokeModelRequest invokeRequest = InvokeModelRequest.builder()
                    .modelId(modelId)
                    .body(SdkBytes.fromUtf8String(requestBody))
                    .build();

            InvokeModelResponse response = bedrockClient.invokeModel(invokeRequest);

            log.info("Bedrock response: {}", response);

            String responseBody = response.body().asUtf8String();

            log.info("Bedrock response body: {}", responseBody);

            TranscriptionSummaryResponse summary = parseNovaResponse(responseBody);
            log.info("Summary: {}", summary);

            return summary;
        } catch (Exception e) {
            log.error("Failed to generate transcription summary for appointment: {}", request.appointmentId(), e);
            return TranscriptionSummaryResponse.builder()
                    .success(false)
                    .errorMessage("Failed to generate summary: " + e.getMessage())
                    .build();
        }
    }

    @Override
    public String getModelIdentifier() {
        return modelId;
    }

    private String buildPrompt(TranscriptionSummaryRequest request) {
        return String.format(
                """
                        You are a medical AI assistant helping to summarize a telemedicine appointment transcription.

                        **Appointment Details:**
                        - Patient: %s
                        - Doctor: %s
                        - Appointment Type: %s
                        - Reason for Visit: %s

                        **Transcription:**
                        %s

                        Please provide a comprehensive summary in the following JSON format:
                        {
                            "patientSummary": "A clear, concise summary for the patient in simple language, including key points discussed, recommendations, and next steps",
                            "doctorSummary": "A detailed clinical summary for the doctor including key observations, patient concerns, recommendations made, and follow-up required",
                            "keyPoints": ["List of important medical points and findings discussed"],
                            "actionItems": ["List of specific actions, medications, or follow-ups recommended"]
                        }

                        Important guidelines:
                        - Use clear, professional medical language for doctor summary
                        - Use simple, patient-friendly language for patient summary
                        - Focus on actionable items and important medical information
                        - Ensure accuracy and maintain patient confidentiality
                        - If the transcription is unclear or incomplete, note this in the summaries
                        - Ensure to provide paragraphs instead of bullet points for the content of each JSON key
                        """,
                request.patientName(),
                request.doctorName(),
                request.appointmentType(),
                request.reasonForVisit(),
                request.transcriptionText());
    }

    private String buildNovaRequest(String prompt) throws JsonProcessingException {
        ObjectNode root = objectMapper.createObjectNode();

        // Add user message under messages array
        ArrayNode messagesArray = objectMapper.createArrayNode();
        ObjectNode userMessage = objectMapper.createObjectNode();
        userMessage.put("role", "user");

        ArrayNode userContentArray = objectMapper.createArrayNode();
        ObjectNode userTextContent = objectMapper.createObjectNode();
        userTextContent.put("text", prompt);
        userContentArray.add(userTextContent);

        userMessage.set("content", userContentArray);
        messagesArray.add(userMessage);

        root.set("messages", messagesArray);

        // Add inferenceConfig (valid keys under this object)
        ObjectNode inferenceConfig = objectMapper.createObjectNode();
        inferenceConfig.put("maxTokens", 2048);       // Optional
        inferenceConfig.put("temperature", 0.7);      // Optional
        inferenceConfig.put("topP", 0.9);             // Optional
        inferenceConfig.put("topK", 20);              // Optional
        root.set("inferenceConfig", inferenceConfig);

        return objectMapper.writeValueAsString(root);
    }

    private TranscriptionSummaryResponse parseNovaResponse(String responseBody) {
        try {
            JsonNode response = objectMapper.readTree(responseBody);
            JsonNode contentArray = response.path("output").path("message").path("content");

            String text = null;
            if (contentArray.isArray() && !contentArray.isEmpty()) {
                text = contentArray.get(0).path("text").asText();
            }

            if (text == null || text.trim().isEmpty()) {
                return TranscriptionSummaryResponse.builder()
                        .success(false)
                        .errorMessage("Empty response from Nova model")
                        .build();
            }

            // Extract JSON substring
            int jsonStart = text.indexOf("{");
            int jsonEnd = text.lastIndexOf("}") + 1;

            if (jsonStart >= 0 && jsonEnd > jsonStart) {
                String jsonStr = text.substring(jsonStart, jsonEnd).trim();

                JsonNode summaryJson;
                try {
                    // Try to parse directly
                    summaryJson = objectMapper.readTree(jsonStr);
                } catch (JsonProcessingException e) {
                    // Maybe it's a stringified JSON, try parsing again
                    log.warn("First JSON parse failed, attempting to double-parse escaped string");
                    summaryJson = objectMapper.readTree(objectMapper.readTree(jsonStr).asText());
                }

                return TranscriptionSummaryResponse.builder()
                        .patientSummary(summaryJson.path("patientSummary").asText(null))
                        .doctorSummary(summaryJson.path("doctorSummary").asText(null))
                        .keyPoints(parseArrayField(summaryJson.path("keyPoints")))
                        .actionItems(parseArrayField(summaryJson.path("actionItems")))
                        .success(true)
                        .build();
            }

            return TranscriptionSummaryResponse.builder()
                    .success(false)
                    .errorMessage("Invalid JSON format in Nova response")
                    .build();

        } catch (Exception e) {
            log.error("Failed to parse Nova response", e);
            return TranscriptionSummaryResponse.builder()
                    .success(false)
                    .errorMessage("Failed to parse AI response: " + e.getMessage())
                    .build();
        }
    }

    private List<String> parseArrayField(JsonNode arrayNode) {
        List<String> items = new ArrayList<>();
        if (arrayNode.isArray()) {
            arrayNode.forEach(item -> items.add(item.asText()));
        }
        return items;
    }
}
