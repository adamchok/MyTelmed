package com.mytelmed.core.family.dto;

import jakarta.validation.constraints.NotNull;

public record UpdateFamilyPermissionsRequestDto(
        @NotNull(message = "canViewMedicalRecords is required")
        boolean canViewMedicalRecords,
        
        @NotNull(message = "canViewAppointments is required")
        boolean canViewAppointments,
        
        @NotNull(message = "canManageAppointments is required")
        boolean canManageAppointments,
        
        @NotNull(message = "canViewPrescriptions is required")
        boolean canViewPrescriptions,
        
        @NotNull(message = "canManagePrescriptions is required")
        boolean canManagePrescriptions,
        
        @NotNull(message = "canViewBilling is required")
        boolean canViewBilling,
        
        @NotNull(message = "canManageBilling is required")
        boolean canManageBilling
) {
}
