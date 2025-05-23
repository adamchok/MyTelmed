package com.mytelmed.core.family.dto;

import java.time.Instant;


public record FamilyMemberDto(
        String id,
        String name,
        String relationship,
        String email,
        Instant createdAt,
        Instant updatedAt
) {
}
