package com.mytelmed.core.prescription.dto;

import com.mytelmed.common.constant.prescription.PrescriptionStatus;
import com.mytelmed.core.appointment.dto.AppointmentDto;
import com.mytelmed.core.pharmacist.dto.PharmacistDto;
import com.mytelmed.core.delivery.dto.MedicationDeliverySimpleDto;
import java.time.Instant;
import java.util.List;

/**
 * DTO for medical prescription data in Malaysian public healthcare
 * telemedicine.
 * Now includes delivery information to optimize API calls.
 */
public record PrescriptionDto(
        String id,
        String prescriptionNumber,
        AppointmentDto appointment,
        PharmacistDto pharmacist,
        String diagnosis,
        String notes,
        String instructions,
        PrescriptionStatus status,
        List<PrescriptionItemDto> prescriptionItems,
        Instant expiryDate,
        Instant createdAt,
        Instant updatedAt,
        MedicationDeliverySimpleDto delivery) {
}
