package com.mytelmed.core.family.dto;

import com.mytelmed.core.patient.dto.PatientDto;
import java.time.Instant;


public record FamilyMemberDto(
        String id,
        PatientDto patient,
        String name,
        String relationship,
        String email,
        boolean pending,
        boolean canViewMedicalRecords,
        boolean canViewAppointments,
        boolean canManageAppointments,
        boolean canViewPrescriptions,
        boolean canManagePrescriptions,
        boolean canViewBilling,
        boolean canManageBilling,
        Instant createdAt,
        Instant updatedAt
) {
}
