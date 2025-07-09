package com.mytelmed.core.patient.dto;

import lombok.Builder;
import java.time.Instant;


@Builder
public record PatientDto(
        String id,
        String name,
        String nric,
        String email,
        String serialNumber,
        String phone,
        String dateOfBirth,
        String gender,
        String profileImageUrl,
        boolean enabled,
        Instant createdAt,
        Instant updatedAt
) {
}
