package com.mytelmed.core.family.dto;

import com.mytelmed.common.constant.family.FamilyPermissionType;
import java.time.Instant;


public record FamilyMemberPermissionDto(
        String id,
        String familyMemberId,
        FamilyPermissionType permissionType,
        boolean granted,
        String expiryDate,
        String notes,
        Instant createdAt,
        Instant updatedAt
) {
}
