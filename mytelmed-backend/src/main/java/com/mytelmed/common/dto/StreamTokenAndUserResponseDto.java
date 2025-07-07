package com.mytelmed.common.dto;

import lombok.Builder;


@Builder
public record StreamTokenAndUserResponseDto(
        String token,
        String userId,
        String name
) {
}
