package com.mytelmed.core.doctor.dto;

import com.mytelmed.core.facility.dto.FacilityDto;
import com.mytelmed.core.speciality.dto.SpecialityDto;
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
        List<SpecialityDto> specialityList,
        List<String> languageList,
        String qualifications,
        String profileImageUrl,
        Instant createdAt,
        Instant updatedAt
) {
}
