package com.mytelmed.core.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;


public record UpdateAccountUsernameRequestDto(
        @NotBlank(message = "Username is required")
        @Size(min = 3, max = 20, message = "Username must be between 3 and 20 characters")
        String newUsername,

        @NotBlank(message = "Password is required")
        String currentPassword
) {
}
