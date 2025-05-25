package com.mytelmed.core.reset.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;


public record ResetEmailRequestDto(
        @Email(message = "Email is invalid")
        @NotBlank(message = "Email is required")
        String email
) {
}
