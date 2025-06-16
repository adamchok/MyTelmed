package com.mytelmed.common.events.email;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;


public record AccountDeactivatedEvent(
        @Email
        @NotBlank(message = "Email is required")
        String email,

        @NotBlank(message = "Name is required")
        String name,

        @NotBlank(message = "Username is required")
        String username
) {
}
