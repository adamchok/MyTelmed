package com.mytelmed.model.dto.response;


import lombok.Builder;


@Builder
public record RegistrationResponseDto(
        boolean isSuccess, String message
) {}
