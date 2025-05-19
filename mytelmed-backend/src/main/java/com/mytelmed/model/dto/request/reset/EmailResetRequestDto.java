package com.mytelmed.model.dto.request.reset;

public record EmailResetRequestDto(
        String nric,
        String name,
        String phone,
        String serialNumber,
        String email
) {}
