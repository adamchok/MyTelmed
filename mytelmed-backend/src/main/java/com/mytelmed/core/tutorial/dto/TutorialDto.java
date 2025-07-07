package com.mytelmed.core.tutorial.dto;

import java.time.Instant;


public record TutorialDto(
        String id,
        String title,
        String description,
        String category,
        Integer duration,
        String videoUrl,
        String thumbnailUrl,
        Instant createdAt,
        Instant updatedAt
) {
}
