package com.mytelmed.core.reset.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import com.mytelmed.common.constant.AccountType;


public record InitiateEmailResetRequestDto(
        @Pattern(regexp = "\\d{12}", message = "NRIC must be 12 digits")
        @NotBlank(message = "NRIC is required")
        String nric,

        @Pattern(regexp = "\\d{10}", message = "Phone number must be 10 digits")
        @NotBlank(message = "Phone number is required")
        String phone,

        String serialNumber, // Optional for non-patient users

        @NotBlank(message = "Name is required")
        String name,

        @Email(message = "Email is invalid")
        @NotBlank(message = "Email is required")
        String email,

        @NotBlank(message = "User type is required")
        AccountType userType
) {
}
