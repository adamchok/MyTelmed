package com.mytelmed.core.notification.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;


public record PushSubscriptionRequestDto(
        @NotBlank(message = "Endpoint is required")
        @Size(max = 1000, message = "Endpoint must not exceed 1000 characters")
        String endpoint,

        @NotBlank(message = "P256DH key is required")
        @Size(max = 500, message = "P256DH key must not exceed 500 characters")
        String p256dh,

        @NotBlank(message = "Auth key is required")
        @Size(max = 500, message = "Auth key must not exceed 500 characters")
        String auth,

        @Size(max = 500, message = "User agent must not exceed 500 characters")
        String userAgent,

        @Size(max = 500, message = "Device info must not exceed 500 characters")
        String deviceInfo
) {
}
