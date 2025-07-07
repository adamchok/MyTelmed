package com.mytelmed.core.prescription.dto;

import com.mytelmed.common.constant.prescription.DeliveryType;
import com.mytelmed.common.constant.prescription.PrescriptionStatus;
import com.mytelmed.core.address.dto.AddressDto;
import com.mytelmed.core.appointment.dto.AppointmentDto;
import com.mytelmed.core.pharmacist.dto.PharmacistDto;
import java.time.Instant;


public record PrescriptionDto(
        String id,
        String prescriptionNumber,
        AppointmentDto appointment,
        PharmacistDto pharmacist,
        String diagnosis,
        String notes,
        String instructions,
        DeliveryType deliveryType,
        PrescriptionStatus status,
        AddressDto address,
        Instant expiryDate,
        Instant pickedUpAt,
        Instant deliveredAt,
        Instant createdAt,
        Instant updatedAt
) {
}
