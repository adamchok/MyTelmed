package com.mytelmed.core.pharmacist.dto;

import com.mytelmed.common.constants.Gender;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;


public record UpdatePharmacistProfileRequestDto(
        @NotBlank(message = "Name is required")
        String name,

        @Pattern(regexp = "^\\d{9}$", message = "Phone number must be exactly 9 digits")
        @NotBlank(message = "Phone is required")
        String phone,

        @NotBlank(message = "Date of birth is required")
        String dateOfBirth,

        @NotBlank(message = "Gender is required")
        Gender gender
) {
}
