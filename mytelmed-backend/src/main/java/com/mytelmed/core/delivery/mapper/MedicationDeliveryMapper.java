package com.mytelmed.core.delivery.mapper;

import com.mytelmed.core.delivery.dto.MedicationDeliveryDto;
import com.mytelmed.core.delivery.entity.MedicationDelivery;
import org.springframework.stereotype.Component;

/**
 * Mapper for converting between MedicationDelivery entities and DTOs.
 */
@Component
public class MedicationDeliveryMapper {

  /**
   * Converts MedicationDelivery entity to DTO
   */
  public MedicationDeliveryDto toDto(MedicationDelivery delivery) {
    if (delivery == null) {
      return null;
    }

    return new MedicationDeliveryDto(
        delivery.getId(),
        delivery.getPrescription() != null ? delivery.getPrescription().getId() : null,
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
   * Converts MedicationDelivery DTO to entity
   * Note: This method doesn't set all fields as some require special handling
   * (like prescription relationship)
   */
  public MedicationDelivery toEntity(MedicationDeliveryDto dto) {
    if (dto == null) {
      return null;
    }

    return MedicationDelivery.builder()
        .id(dto.id())
        .deliveryMethod(dto.deliveryMethod())
        .status(dto.status())
        .deliveryInstructions(dto.deliveryInstructions())
        .deliveryFee(dto.deliveryFee())
        .estimatedDeliveryDate(dto.estimatedDeliveryDate())
        .actualDeliveryDate(dto.actualDeliveryDate())
        .pickupDate(dto.pickupDate())
        .trackingReference(dto.trackingReference())
        .courierName(dto.courierName())
        .deliveryContactPhone(dto.deliveryContactPhone())
        .deliveryNotes(dto.deliveryNotes())
        .cancellationReason(dto.cancellationReason())
        .createdAt(dto.createdAt())
        .updatedAt(dto.updatedAt())
        .build();
  }
}