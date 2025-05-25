package com.mytelmed.core.notification.dto;

import java.time.Instant;


public record NotificationDto(
        Long id,
        String title,
        String content,
        String imageUrl,
        String actionUrl,
        String type,
        Instant createdAt,
        Instant readAt,
        boolean isRead
) {
}
