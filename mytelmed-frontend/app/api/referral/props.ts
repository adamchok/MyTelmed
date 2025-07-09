import { Patient } from "../patient/props";
import { Doctor } from "../doctor/props";
import { AppointmentDto } from "../appointment/props";
import { SearchOptions } from "../props";

// Referral Enums
export enum ReferralType {
    INTERNAL = "INTERNAL", // Referral to doctor within the system
    EXTERNAL = "EXTERNAL", // Referral to doctor outside the system
}

export enum ReferralStatus {
    PENDING = "PENDING", // Referral created, waiting for action
    ACCEPTED = "ACCEPTED", // Referred doctor accepted the referral
    REJECTED = "REJECTED", // Referred doctor rejected the referral
    SCHEDULED = "SCHEDULED", // Appointment scheduled with referred doctor
    COMPLETED = "COMPLETED", // Referral completed (appointment done)
    EXPIRED = "EXPIRED", // Referral expired (not acted upon in time)
    CANCELLED = "CANCELLED", // Referral cancelled by referring doctor or patient
}

export enum ReferralPriority {
    ROUTINE = "ROUTINE", // Regular referral, no urgency
    URGENT = "URGENT", // Urgent referral, needs attention within days
    EMERGENCY = "EMERGENCY", // Emergency referral, immediate attention required
}

// Main Referral DTO
export interface ReferralDto {
    id: string;
    referralNumber: string;
    patient: Patient;
    referringDoctor: Doctor;
    referredDoctor?: Doctor;
    referralType: ReferralType;
    status: ReferralStatus;
    priority: ReferralPriority;
    clinicalSummary: string;
    reasonForReferral: string;
    investigationsDone?: string;
    currentMedications?: string;
    allergies?: string;
    vitalSigns?: string;

    // External doctor details (for EXTERNAL referrals)
    externalDoctorName?: string;
    externalDoctorSpeciality?: string;
    externalFacilityName?: string;
    externalFacilityAddress?: string;
    externalContactNumber?: string;
    externalEmail?: string;

    // Appointment details
    scheduledAppointment?: AppointmentDto;

    // Status timestamps
    acceptedAt?: string;
    rejectedAt?: string;
    rejectionReason?: string;
    completedAt?: string;

    expiryDate: string; // LocalDate as string
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

// Request DTOs
export interface CreateReferralRequestDto {
    patientId: string;
    referralType: ReferralType;

    // For internal referrals
    referredDoctorId?: string;

    // For external referrals
    externalDoctorName?: string;
    externalDoctorSpeciality?: string;
    externalFacilityName?: string;
    externalFacilityAddress?: string;
    externalContactNumber?: string;
    externalEmail?: string;

    priority: ReferralPriority;
    clinicalSummary: string;
    reasonForReferral: string;
    investigationsDone?: string;
    currentMedications?: string;
    allergies?: string;
    vitalSigns?: string;
    expiryDate: string; // Format: dd-MM-yyyy
    notes?: string;
}

export interface UpdateReferralStatusRequestDto {
    status: ReferralStatus;
    rejectionReason?: string;
    notes?: string;
}

// Statistics DTO
export interface ReferralStatisticsDto {
    pendingCount: number;
    acceptedCount: number;
    scheduledCount: number;
    completedCount: number;
}

// Search/filter options
export type ReferralSearchOptions = SearchOptions;
