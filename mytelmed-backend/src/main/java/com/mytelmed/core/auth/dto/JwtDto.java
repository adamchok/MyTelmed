package com.mytelmed.core.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;


@Builder
public record JwtDto(
        @NotBlank(message = "Access token is required")
        String accessToken,

        @NotBlank(message = "Refresh token is required")
        String refreshToken
) {
}
