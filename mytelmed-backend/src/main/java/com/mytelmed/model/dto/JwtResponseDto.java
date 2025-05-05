package com.mytelmed.model.dto;

import lombok.Builder;


@Builder
public record JwtResponseDto(
        String accessToken,
        String refreshToken
) {}
