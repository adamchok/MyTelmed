package com.mytelmed.core.patient.dto;

import com.mytelmed.common.constant.Gender;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;


public record UpdatePatientProfileRequestDto(
        @NotBlank(message = "Name is required")
        @Size(min = 2, max = 50, message = "Name must be between 2 and 50 characters")
        String name,

        @Email(message = "Email should be valid")
        @NotBlank(message = "Email is required")
        String email,

        @Pattern(regexp = "^\\d{9}$", message = "Phone number must be exactly 9 digits")
        @NotBlank(message = "Phone is required")
        String phone,

        @NotBlank(message = "Date of birth is required")
        @Pattern(regexp = "^\\d{2}-\\d{2}-\\d{4}$", message = "Date of birth must be in the format MM-DD-YYYY")
        String dateOfBirth,

        @NotNull(message = "Gender is required")
        Gender gender
) {
}
