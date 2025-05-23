package com.mytelmed.core.family.dto;

import jakarta.validation.constraints.NotBlank;


public record CreateFamilyMemberRequestDto(
        @NotBlank(message = "NRIC is required")
        String nric,

        @NotBlank(message = "Name is required")
        String name,

        @NotBlank(message = "Email is required")
        String email,

        @NotBlank(message = "Relationship is required")
        String relationship
) {
}
