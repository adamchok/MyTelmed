package com.mytelmed.core.family.dto;

import com.mytelmed.common.constant.family.FamilyPermissionType;
import jakarta.validation.constraints.NotNull;
import java.util.Set;

public record UpdateFamilyPermissionsRequestDto(
        @NotNull(message = "Permissions are required")
        Set<FamilyPermissionType> permissions,
        
        String expiryDate,
        String notes
) {
}
