package com.mytelmed.common.event.account.model;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;


@Builder
public record AccountDeletionEvent(
        @Email
        @NotBlank(message = "Email is required")
        String email,

        @NotBlank(message = "Username is required")
        String username,

        @NotBlank(message = "Role is required")
        String role,

        @NotBlank(message = "Name is required")
        String name
) {
}
