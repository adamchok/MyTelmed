package com.mytelmed.core.notification.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;


public record PushSubscriptionRequestDto(
        @NotBlank(message = "Endpoint is required")
        String endpoint,

        @Valid
        @NotNull(message = "Keys are required")
        Keys keys
) {
    public record Keys(
            @NotBlank(message = "p256dh is required")
            String p256dh,

            @NotBlank(message = "Auth is required")
            String auth
    ) {}
}
