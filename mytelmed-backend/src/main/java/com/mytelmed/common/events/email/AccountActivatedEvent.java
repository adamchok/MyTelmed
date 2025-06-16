package com.mytelmed.common.events.email;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;


public record AccountActivatedEvent(
        @Email
        @NotBlank(message = "Email is required")
        String email,

        @NotBlank(message = "Username is required")
        String username,

        @NotBlank(message = "Password is required")
        String password
) {
}
