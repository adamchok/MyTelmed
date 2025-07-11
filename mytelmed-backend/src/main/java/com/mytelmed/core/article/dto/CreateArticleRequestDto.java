package com.mytelmed.core.article.dto;

import jakarta.validation.constraints.NotBlank;


public record CreateArticleRequestDto(
        @NotBlank(message = "Title is required")
        String title,

        @NotBlank(message = "Content is required")
        String content,

        @NotBlank(message = "Subject is required")
        String subject
) {
}
