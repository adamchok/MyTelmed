package com.mytelmed.model.dto;

public record PatientDto(
        String id,
        String name,
        String nric,
        String email,
        String phone,
        String gender,
        String dob
) {}
