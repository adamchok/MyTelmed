package com.mytelmed.model.dto.request;

import jakarta.validation.constraints.NotBlank;


public record CodeVerificationRequestDto(
        @NotBlank(message = "Email is required")
        String email,

        @NotBlank(message = "Token is required")
        String token
) {}
