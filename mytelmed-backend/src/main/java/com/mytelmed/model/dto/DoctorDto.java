package com.mytelmed.model.dto;

import lombok.Builder;


@Builder
public record DoctorDto(
        String id,
        String name,
        String nric,
        String email,
        String phone,
        String serialNumber,
        String gender,
        String dob,
        DepartmentDto department,
        FacilityDto facility,
        String specialization,
        String imageUrl,
        String description
) {}
