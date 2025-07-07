package com.mytelmed.core.verification.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;


public record SendVerificationEmailRequestDto(
        @Email(message = "Email is invalid")
        @NotBlank(message = "Email is required")
        String email
) {
}