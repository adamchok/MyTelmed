package com.mytelmed.core.reset.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;


public record InitiatePasswordResetRequestDto(
        @Email(message = "Email is invalid")
        @NotBlank(message = "Email is required")
        String email,

        @Pattern(regexp = "\\d{12}", message = "NRIC must be 12 digits")
        @NotBlank(message = "NRIC is required")
        String nric
) {
}
