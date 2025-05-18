package com.mytelmed.model.dto.response;

import lombok.Builder;

@Builder
public record PasswordResetResponseDto(
    boolean isSuccess,
    String message
) {}