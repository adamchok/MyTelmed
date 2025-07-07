package com.mytelmed.core.admin.dto;

import lombok.Builder;
import java.time.Instant;


@Builder
public record AdminDto(
        String id,
        String name,
        String nric,
        String email,
        String phone,
        String profileImageUrl,
        Instant createdAt,
        Instant updatedAt
) {
}
