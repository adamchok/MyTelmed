package com.mytelmed.core.auth.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.UUID;


public record RefreshTokenRequestDto(
        @NotBlank(message = "Refresh token is required")
        UUID refreshToken
) {
}
