package com.mytelmed.core.pharmacist.dto;

import com.mytelmed.core.facility.dto.FacilityDto;
import java.time.Instant;


public record PharmacistDto(
        String id,
        String name,
        String nric,
        String email,
        String phone,
        String dateOfBirth,
        String gender,
        FacilityDto facility,
        String profileImageUrl,
        Instant createdAt,
        Instant updatedAt
) {
}
