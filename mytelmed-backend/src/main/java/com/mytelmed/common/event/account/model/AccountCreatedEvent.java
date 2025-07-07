package com.mytelmed.common.event.account.model;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;


@Builder
public record AccountCreatedEvent(
        @Email
        @NotBlank(message = "Email is required")
        String email,

        @NotBlank(message = "Name is required")
        String name,

        @NotBlank(message = "Username is required")
        String username,

        @NotBlank(message = "Password is required")
        String password
) {
}
