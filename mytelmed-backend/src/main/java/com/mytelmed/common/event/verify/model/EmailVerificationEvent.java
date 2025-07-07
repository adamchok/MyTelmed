package com.mytelmed.common.event.verify.model;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;


@Builder
public record EmailVerificationEvent(
        @Email(message = "Email is invalid")
        @NotBlank(message = "Email is required")
        String email,

        @NotBlank(message = "Verification token is required")
        String token
) {
}
