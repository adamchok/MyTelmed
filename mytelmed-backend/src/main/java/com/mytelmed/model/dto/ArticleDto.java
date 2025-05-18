package com.mytelmed.model.dto;

import lombok.Builder;


@Builder
public record ArticleDto(
        String id,
        String title,
        String content,
        String department,
        String author,
        String createdAt,
        String updatedAt,
        String imageUrl,
        boolean featured,
        String[] tags
) {}
