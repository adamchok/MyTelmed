package com.mytelmed.core.delivery.mapper;

import com.mytelmed.core.delivery.dto.MedicationDeliveryDto;
import com.mytelmed.core.delivery.dto.MedicationDeliverySimpleDto;
import com.mytelmed.core.delivery.entity.MedicationDelivery;
import com.mytelmed.core.prescription.mapper.PrescriptionMapper;
import com.mytelmed.infrastructure.aws.service.AwsS3Service;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

/**
 * Mapper for converting between MedicationDelivery entities and DTOs.
 */
@Component
public class MedicationDeliveryMapper {
    private final PrescriptionMapper prescriptionMapper;
    private final AwsS3Service awsS3Service;

    public MedicationDeliveryMapper(@Lazy PrescriptionMapper prescriptionMapper, AwsS3Service awsS3Service) {
        this.prescriptionMapper = prescriptionMapper;
        this.awsS3Service = awsS3Service;
    }

    /**
     * Converts MedicationDelivery entity to DTO
     */
    public MedicationDeliveryDto toDto(MedicationDelivery delivery) {
        if (delivery == null) {
            return null;
        }

        return new MedicationDeliveryDto(
                delivery.getId(),
                delivery.getPrescription() != null ? prescriptionMapper.toDto(delivery.getPrescription(), awsS3Service)
                        : null,
                delivery.getDeliveryMethod(),
                delivery.getStatus(),
                delivery.getDeliveryInstructions(),
                delivery.getDeliveryFee(),
                delivery.getEstimatedDeliveryDate(),
                delivery.getActualDeliveryDate(),
                delivery.getPickupDate(),
                delivery.getTrackingReference(),
                delivery.getCourierName(),
                delivery.getDeliveryContactPhone(),
                delivery.getDeliveryNotes(),
                delivery.getCancellationReason(),
                delivery.getCreatedAt(),
                delivery.getUpdatedAt());
    }

    /**
     * Converts MedicationDelivery entity to simple DTO (without prescription
     * details)
     */
    public MedicationDeliverySimpleDto toSimpleDto(MedicationDelivery delivery) {
        if (delivery == null) {
            return null;
        }

        return new MedicationDeliverySimpleDto(
                delivery.getId(),
                delivery.getDeliveryMethod(),
                delivery.getStatus(),
                delivery.getDeliveryInstructions(),
                delivery.getDeliveryFee(),
                delivery.getEstimatedDeliveryDate(),
                delivery.getActualDeliveryDate(),
                delivery.getPickupDate(),
                delivery.getTrackingReference(),
                delivery.getCourierName(),
                delivery.getDeliveryContactPhone(),
                delivery.getDeliveryNotes(),
                delivery.getCancellationReason(),
                delivery.getCreatedAt(),
                delivery.getUpdatedAt());
    }
}
