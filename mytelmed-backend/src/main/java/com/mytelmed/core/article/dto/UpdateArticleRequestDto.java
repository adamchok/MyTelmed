package com.mytelmed.core.article.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.UUID;

public record UpdateArticleRequestDto(
        @NotBlank(message = "Title is required")
        String title,

        @NotBlank(message = "Content is required")
        String content
) {
}
