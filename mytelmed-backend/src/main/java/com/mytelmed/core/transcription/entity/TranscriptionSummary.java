package com.mytelmed.core.transcription.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbAttribute;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSortKey;

import java.time.Instant;
import java.util.List;

/**
 * DynamoDB entity for storing video call transcription summaries.
 * Stores AI-generated summaries of appointment video calls for both doctors and
 * patients.
 */
@DynamoDbBean
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TranscriptionSummary {
    private String appointmentId;
    private String summaryId;
    private String rawTranscription;
    private String patientSummary;
    private String doctorSummary;
    private List<String> keyPoints;
    private List<String> actionItems;
    private String processingStatus;
    private String aiModel;
    private Instant createdAt;
    private Instant updatedAt;
    private String errorMessage;

    @DynamoDbPartitionKey
    @DynamoDbAttribute("appointment_id")
    public String getAppointmentId() {
        return appointmentId;
    }

    @DynamoDbSortKey
    @DynamoDbAttribute("summary_id")
    public String getSummaryId() {
        return summaryId;
    }

    @DynamoDbAttribute("raw_transcription")
    public String getRawTranscription() {
        return rawTranscription;
    }

    @DynamoDbAttribute("patient_summary")
    public String getPatientSummary() {
        return patientSummary;
    }

    @DynamoDbAttribute("doctor_summary")
    public String getDoctorSummary() {
        return doctorSummary;
    }

    @DynamoDbAttribute("key_points")
    public List<String> getKeyPoints() {
        return keyPoints;
    }

    @DynamoDbAttribute("action_items")
    public List<String> getActionItems() {
        return actionItems;
    }

    @DynamoDbAttribute("processing_status")
    public String getProcessingStatus() {
        return processingStatus;
    }

    @DynamoDbAttribute("ai_model")
    public String getAiModel() {
        return aiModel;
    }

    @DynamoDbAttribute("created_at")
    public Instant getCreatedAt() {
        return createdAt;
    }

    @DynamoDbAttribute("updated_at")
    public Instant getUpdatedAt() {
        return updatedAt;
    }

    @DynamoDbAttribute("error_message")
    public String getErrorMessage() {
        return errorMessage;
    }
}
