package com.mytelmed.core.auth.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;


public record RefreshTokenRequestDto(
        @NotNull(message = "Refresh token is required")
        UUID refreshToken
) {
}
