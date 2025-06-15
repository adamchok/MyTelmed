package com.mytelmed.core.article.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.UUID;

public record CreateArticleRequestDto(
        @NotBlank(message = "Title is required")
        String title,

        @NotBlank(message = "Content is required")
        String content,

        @NotBlank(message = "Speciality ID is required")
        UUID specialityId
) {
}
