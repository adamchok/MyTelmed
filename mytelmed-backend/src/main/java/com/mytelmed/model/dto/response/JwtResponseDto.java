package com.mytelmed.model.dto.response;

import lombok.Builder;


@Builder
public record JwtResponseDto(
        String accessToken,
        String refreshToken
) {}
