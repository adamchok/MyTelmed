package com.mytelmed.common.event.reset.model;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;


@Builder
public record EmailResetEvent(
        @Email(message = "Email is invalid")
        @NotBlank(message = "Email is required")
        String email,

        @NotBlank(message = "Name is required")
        String name,

        @NotBlank(message = "Reset URL is required")
        String resetUrl,

        @NotNull(message = "Expiration minutes is required")
        long expirationMinutes
) {
}
