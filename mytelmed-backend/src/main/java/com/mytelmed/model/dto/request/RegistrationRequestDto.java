package com.mytelmed.model.dto.request;

import jakarta.validation.constraints.NotBlank;


public record RegistrationRequestDto(
        @NotBlank(message = "Name is required")
        String name,

        @NotBlank(message = "NRIC is required")
        String nric,

        @NotBlank(message = "Serial number is required")
        String serialNumber,

        @NotBlank(message = "Email is required")
        String email,

        @NotBlank(message = "Phone number is required")
        String phone,

        @NotBlank(message = "Gender is required")
        String gender,

        @NotBlank(message = "Date of birth is required")
        String dob,

        @NotBlank(message = "Password is required")
        String password
) {}
