import { BaseEntity } from "../props";

// Family Member DTO - matches FamilyMemberDto from backend
export interface FamilyMember extends BaseEntity {
    patient?: {
        id: string;
        name: string;
        nric: string;
        email: string;
        phone: string;
        dateOfBirth: string;
        gender: string;
        profileImageUrl?: string;
        enabled: boolean;
        createdAt: string;
        updatedAt: string;
    };
    name: string;
    relationship: string;
    email: string;
    pending: boolean;
    canViewMedicalRecords: boolean;
    canViewAppointments: boolean;
    canManageAppointments: boolean;
    canViewPrescriptions: boolean;
    canManagePrescriptions: boolean;
    canViewBilling: boolean;
    canManageBilling: boolean;
}

// Create Family Member Request DTO - matches CreateFamilyMemberRequestDto from backend
export interface CreateFamilyMemberRequest {
    nric: string;
    name: string;
    email: string;
    relationship: string;
}

// Update Family Member Request DTO - matches UpdateFamilyMemberRequestDto from backend
export interface UpdateFamilyMemberRequest {
    name: string;
    relationship: string;
}

// Update Family Permissions Request DTO - matches UpdateFamilyPermissionsRequestDto from backend
export interface UpdateFamilyPermissionsRequest {
    canViewMedicalRecords: boolean;
    canViewAppointments: boolean;
    canManageAppointments: boolean;
    canViewPrescriptions: boolean;
    canManagePrescriptions: boolean;
    canViewBilling: boolean;
    canManageBilling: boolean;
}
