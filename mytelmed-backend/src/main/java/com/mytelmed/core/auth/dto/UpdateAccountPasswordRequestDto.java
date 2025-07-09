package com.mytelmed.core.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;


public record UpdateAccountPasswordRequestDto(
        @NotBlank(message = "Password is required")
        @Pattern(
                regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
                message = "Password must be at least 8 characters long and include uppercase, lowercase, digit, and special character"
        )
        String newPassword,

        @NotBlank(message = "Current password is required")
        String currentPassword
) {
}
