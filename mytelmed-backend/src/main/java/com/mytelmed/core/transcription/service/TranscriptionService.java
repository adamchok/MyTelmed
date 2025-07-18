package com.mytelmed.core.transcription.service;

import com.mytelmed.common.advice.AppException;
import com.mytelmed.common.advice.exception.ResourceNotFoundException;
import com.mytelmed.common.constant.transcription.ProcessingStatus;
import com.mytelmed.core.appointment.entity.Appointment;
import com.mytelmed.core.appointment.repository.AppointmentRepository;
import com.mytelmed.core.transcription.entity.TranscriptionSummary;
import com.mytelmed.infrastructure.ai.dto.TranscriptionSummaryRequest;
import com.mytelmed.infrastructure.ai.dto.TranscriptionSummaryResponse;
import com.mytelmed.infrastructure.ai.service.AiService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.model.QueryConditional;
import software.amazon.awssdk.enhanced.dynamodb.model.QueryEnhancedRequest;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Service for managing transcription summaries
 */
@Slf4j
@Service
public class TranscriptionService {
    private final DynamoDbTable<TranscriptionSummary> transcriptionTable;
    private final AiService aiService;
    private final AppointmentRepository appointmentRepository;

    public TranscriptionService(DynamoDbTable<TranscriptionSummary> transcriptionTable,
            AiService aiService,
            AppointmentRepository appointmentRepository) {
        this.transcriptionTable = transcriptionTable;
        this.aiService = aiService;
        this.appointmentRepository = appointmentRepository;
    }

    /**
     * Process transcription asynchronously when video call ends
     */
    @Async
    public void processTranscriptionAsync(UUID appointmentId, String transcriptionText) {
        try {
            log.info("Starting async transcription processing for appointment: {}", appointmentId);

            // Create initial pending record
            TranscriptionSummary pendingSummary = createPendingTranscriptionSummary(appointmentId);
            transcriptionTable.putItem(pendingSummary);

            // Update status to processing
            updateProcessingStatus(appointmentId, pendingSummary.getSummaryId());

            // Get appointment details
            Appointment appointment = appointmentRepository.findById(appointmentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

            // Build AI request
            TranscriptionSummaryRequest aiRequest = TranscriptionSummaryRequest.builder()
                    .appointmentId(appointmentId)
                    .transcriptionText(transcriptionText)
                    .patientName(appointment.getPatient().getName())
                    .doctorName(appointment.getDoctor().getName())
                    .appointmentType(appointment.getConsultationMode().toString())
                    .reasonForVisit(appointment.getReasonForVisit())
                    .build();

            // Generate summary using AI service
            TranscriptionSummaryResponse aiResponse = aiService.generateTranscriptionSummary(aiRequest);

            if (aiResponse.success()) {
                // Save successful summary
                pendingSummary.setRawTranscription(transcriptionText);
                pendingSummary.setPatientSummary(aiResponse.patientSummary());
                pendingSummary.setDoctorSummary(aiResponse.doctorSummary());
                pendingSummary.setKeyPoints(aiResponse.keyPoints());
                pendingSummary.setActionItems(aiResponse.actionItems());
                pendingSummary.setProcessingStatus(ProcessingStatus.COMPLETED.getStatus());
                pendingSummary.setAiModel(aiService.getModelIdentifier());
                pendingSummary.setUpdatedAt(Instant.now());

                transcriptionTable.putItem(pendingSummary);
                log.info("Successfully processed transcription summary for appointment: {}", appointmentId);
            } else {
                // Save failed summary
                updateFailedTranscription(appointmentId, pendingSummary.getSummaryId(), aiResponse.errorMessage());
                log.error("Failed to generate AI summary for appointment: {} - {}", appointmentId,
                        aiResponse.errorMessage());
            }

        } catch (Exception e) {
            log.error("Error processing transcription for appointment: {}", appointmentId, e);
            // Try to update status to failed if possible
            try {
                String summaryId = generateSummaryId(appointmentId);
                updateFailedTranscription(appointmentId, summaryId, e.getMessage());
            } catch (Exception updateEx) {
                log.error("Failed to update transcription status to failed for appointment: {}", appointmentId,
                        updateEx);
            }
        }
    }

    /**
     * Get transcription summary by appointment ID
     */
    public Optional<TranscriptionSummary> getTranscriptionSummary(UUID appointmentId) {
        try {
            QueryConditional queryConditional = QueryConditional.keyEqualTo(
                    Key.builder().partitionValue(appointmentId.toString()).build());

            List<TranscriptionSummary> results = transcriptionTable.query(
                    QueryEnhancedRequest.builder()
                            .queryConditional(queryConditional)
                            .limit(1)
                            .scanIndexForward(false) // Get latest
                            .build())
                    .items().stream().toList();

            return results.isEmpty() ? Optional.empty() : Optional.of(results.get(0));

        } catch (Exception e) {
            log.error("Error retrieving transcription summary for appointment: {}", appointmentId, e);
            return Optional.empty();
        }
    }

    /**
     * Check if transcription summary exists for appointment
     */
    public boolean hasTranscriptionSummary(UUID appointmentId) {
        return getTranscriptionSummary(appointmentId).isPresent();
    }

    /**
     * Delete transcription summary for appointment
     */
    public void deleteTranscriptionSummary(UUID appointmentId) {
        try {
            Optional<TranscriptionSummary> summary = getTranscriptionSummary(appointmentId);
            if (summary.isPresent()) {
                Key key = Key.builder()
                        .partitionValue(summary.get().getAppointmentId())
                        .sortValue(summary.get().getSummaryId())
                        .build();
                transcriptionTable.deleteItem(key);
                log.info("Deleted transcription summary for appointment: {}", appointmentId);
            }
        } catch (Exception e) {
            log.error("Error deleting transcription summary for appointment: {}", appointmentId, e);
            throw new AppException("Failed to delete transcription summary");
        }
    }

    private TranscriptionSummary createPendingTranscriptionSummary(UUID appointmentId) {
        String summaryId = generateSummaryId(appointmentId);
        return TranscriptionSummary.builder()
                .appointmentId(appointmentId.toString())
                .summaryId(summaryId)
                .processingStatus(ProcessingStatus.PENDING.getStatus())
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
    }

    private void updateProcessingStatus(UUID appointmentId, String summaryId) {
        try {
            TranscriptionSummary summary = transcriptionTable.getItem(
                    Key.builder()
                            .partitionValue(appointmentId.toString())
                            .sortValue(summaryId)
                            .build());

            if (summary != null) {
                summary.setProcessingStatus(ProcessingStatus.PROCESSING.getStatus());
                summary.setUpdatedAt(Instant.now());
                transcriptionTable.putItem(summary);
            }
        } catch (Exception e) {
            log.error("Failed to update processing status for appointment: {}", appointmentId, e);
        }
    }

    private void updateFailedTranscription(UUID appointmentId, String summaryId, String errorMessage) {
        try {
            TranscriptionSummary summary = transcriptionTable.getItem(
                    Key.builder()
                            .partitionValue(appointmentId.toString())
                            .sortValue(summaryId)
                            .build());

            if (summary != null) {
                summary.setProcessingStatus(ProcessingStatus.FAILED.getStatus());
                summary.setErrorMessage(errorMessage);
                summary.setUpdatedAt(Instant.now());
                transcriptionTable.putItem(summary);
            }
        } catch (Exception e) {
            log.error("Failed to update failed transcription for appointment: {}", appointmentId, e);
        }
    }

    private String generateSummaryId(UUID appointmentId) {
        return appointmentId.toString() + "-" + Instant.now().toEpochMilli();
    }
}