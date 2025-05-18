package com.mytelmed.model.dto.response;

import lombok.Builder;


@Builder
public record EmailVerificationResponseDto(
        boolean isSuccess,
        String message
) {}
