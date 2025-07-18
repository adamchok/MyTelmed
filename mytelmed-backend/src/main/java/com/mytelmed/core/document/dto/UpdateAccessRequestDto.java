package com.mytelmed.core.document.dto;

import jakarta.validation.constraints.NotNull;


public record UpdateAccessRequestDto(
        @NotNull(message = "Can view permission is required")
        boolean canView,

        @NotNull(message = "Can attach permission is required")
        boolean canAttach,

        String expiryDate
) {
}
