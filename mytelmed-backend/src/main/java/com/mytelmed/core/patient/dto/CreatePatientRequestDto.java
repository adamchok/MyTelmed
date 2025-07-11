package com.mytelmed.core.patient.dto;

import com.mytelmed.common.constant.Gender;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;


public record CreatePatientRequestDto(
        @NotBlank(message = "Name is required")
        @Size(min = 2, max = 50, message = "Name must be between 2 and 50 characters")
        String name,

        @Pattern(regexp = "^\\d{12}$", message = "NRIC must be exactly 12 digits")
        @NotBlank(message = "NRIC is required")
        String nric,

        @Email(message = "Email should be valid")
        @NotBlank(message = "Email is required")
        String email,

        @NotBlank(message = "Serial number is required")
        @Pattern(regexp = "^[A-Za-z0-9]{10}$", message = "Serial number must be exactly 10 alphanumeric characters")
        String serialNumber,

        @Pattern(regexp = "^\\d{10}$", message = "Phone number must be exactly 10 digits")
        @NotBlank(message = "Phone is required")
        String phone,

        @Pattern(regexp = "^\\d{2}/\\d{2}/\\d{4}$", message = "Date of birth must be in the format MM-DD-YYYY")
        @NotBlank(message = "Date of birth is required")
        String dateOfBirth,

        @NotNull(message = "Gender is required")
        Gender gender,

        @NotBlank(message = "Password is required")
        @Pattern(
                regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
                message = "Password must be at least 8 characters long and include uppercase, lowercase, digit, and special character"
        )
        String password
) {
}
