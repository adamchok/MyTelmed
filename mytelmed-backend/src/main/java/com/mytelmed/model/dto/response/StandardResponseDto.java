package com.mytelmed.model.dto.response;

import lombok.Builder;


@Builder
public record StandardResponseDto(
        boolean isSuccess,
        String message
) {}
