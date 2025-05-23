package com.mytelmed.core.auth.dto;

import lombok.Builder;


@Builder
public record JwtDto(
        String accessToken,
        String refreshToken
) {
}
