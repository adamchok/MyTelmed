package com.mytelmed.core.family.dto;

import jakarta.validation.constraints.NotBlank;


public record UpdateFamilyMemberRequestDto(
        @NotBlank(message = "Name is required")
        String name,

        @NotBlank(message = "Relationship is required")
        String relationship
) {
}
