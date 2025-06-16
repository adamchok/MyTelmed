package com.mytelmed.core.tutorial.dto;

import jakarta.validation.constraints.NotBlank;


public record UpdateTutorialRequestDto(
        @NotBlank(message = "Title is required")
        String title,

        @NotBlank(message = "Description is required")
        String description,

        @NotBlank(message = "Category is required")
        String category
) {
}
