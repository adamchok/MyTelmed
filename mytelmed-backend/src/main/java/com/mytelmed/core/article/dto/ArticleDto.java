package com.mytelmed.core.article.dto;

import lombok.Builder;

import java.time.Instant;


@Builder
public record ArticleDto(
        String id,
        String title,
        String speciality,
        String content,
        Instant createdAt,
        Instant updatedAt
) {
}
