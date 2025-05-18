package com.mytelmed.model.dto.response;

import lombok.Builder;


@Builder
public record CodeVerificationResponseDto(
        boolean isSuccess,
        String message
) {}
