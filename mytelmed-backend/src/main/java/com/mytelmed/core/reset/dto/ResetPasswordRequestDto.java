package com.mytelmed.core.reset.dto;

import jakarta.validation.constraints.NotBlank;


public record ResetPasswordRequestDto(
        @NotBlank(message = "Password is required")
        String password
) {
}
