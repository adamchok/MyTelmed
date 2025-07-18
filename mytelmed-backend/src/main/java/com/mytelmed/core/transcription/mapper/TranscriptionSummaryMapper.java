package com.mytelmed.core.transcription.mapper;

import com.mytelmed.core.transcription.dto.TranscriptionSummaryDto;
import com.mytelmed.core.transcription.entity.TranscriptionSummary;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Mapper for TranscriptionSummary entity and DTO
 */
@Component
public class TranscriptionSummaryMapper {

    public TranscriptionSummaryDto toDto(TranscriptionSummary entity) {
        if (entity == null) {
            return null;
        }

        return TranscriptionSummaryDto.builder()
                .appointmentId(UUID.fromString(entity.getAppointmentId()))
                .patientSummary(entity.getPatientSummary())
                .doctorSummary(entity.getDoctorSummary())
                .keyPoints(entity.getKeyPoints())
                .actionItems(entity.getActionItems())
                .processingStatus(entity.getProcessingStatus())
                .aiModel(entity.getAiModel())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .errorMessage(entity.getErrorMessage())
                .build();
    }
}
