package com.mytelmed.core.doctor.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.UUID;


public record UpdateDoctorSpecialtiesAndFacilityRequestDto(
        @NotBlank(message = "Facility ID is required")
        UUID facilityId,

        @NotNull(message = "Specialities are required")
        @Size(min = 1, message = "At least one speciality is required")
        List<String> specialityList
) {
}
