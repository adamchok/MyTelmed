package com.mytelmed.model.dto.response;


import lombok.Builder;


@Builder
public record EmailResetResponseDto(
        boolean isSuccess,
        String message
) {}
