package com.mytelmed.model.dto;

import lombok.Builder;
import java.util.List;


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
        List<String> tags
) {}
