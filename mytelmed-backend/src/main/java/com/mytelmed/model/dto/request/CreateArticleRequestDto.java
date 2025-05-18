package com.mytelmed.model.dto.request;

import jakarta.validation.constraints.NotBlank;


public record CreateArticleRequestDto(
        @NotBlank(message = "Title is required")
        String title,

        @NotBlank(message = "Content is required")
        String content,

        @NotBlank(message = "Department is required")
        String department,

        String author,
        String imageUrl,
        boolean featured,
        String[] tags
) {}
