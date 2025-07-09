package com.mytelmed.core.doctor.dto;

import com.mytelmed.core.facility.dto.FacilityDto;
import java.time.Instant;
import java.util.List;


public record DoctorDto(
        String id,
        String name,
        String nric,
        String email,
        String phone,
        String dateOfBirth,
        String gender,
        FacilityDto facility,
        List<String> specialityList,
        List<String> languageList,
        String qualifications,
        String profileImageUrl,
        boolean enabled,
        Instant createdAt,
        Instant updatedAt
) {
}
