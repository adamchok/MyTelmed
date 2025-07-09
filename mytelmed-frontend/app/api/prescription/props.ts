import { Pharmacist } from "../pharmacist/props";
import { AppointmentDto } from "../appointment/props";
import { SearchOptions } from "../props";

// Prescription Status Enum
export enum PrescriptionStatus {
    CREATED = "CREATED",
    READY_FOR_PROCESSING = "READY_FOR_PROCESSING",
    PROCESSING = "PROCESSING",
    READY = "READY",
    EXPIRED = "EXPIRED",
    CANCELLED = "CANCELLED",
}

// Prescription Item DTOs
export interface PrescriptionItemDto {
    id: string;
    medicationName: string;
    genericName?: string;
    dosageForm: string;
    strength: string;
    quantity: number;
    instructions: string;
    frequency: string;
    duration: string;
    notes?: string;
    isSubstituted?: boolean;
    substitutionReason?: string;
}

export interface CreatePrescriptionItemRequestDto {
    medicationName: string;
    genericName?: string;
    dosageForm: string;
    strength: string;
    quantity: number;
    instructions: string;
    frequency: string;
    duration: string;
    notes?: string;
}

// Main Prescription DTO
export interface PrescriptionDto {
    id: string;
    prescriptionNumber: string;
    appointment: AppointmentDto;
    pharmacist?: Pharmacist;
    diagnosis: string;
    notes?: string;
    instructions: string;
    status: PrescriptionStatus;
    expiryDate: string;
    createdAt: string;
    updatedAt: string;
}

// Request DTOs
export interface CreatePrescriptionRequestDto {
    appointmentId: string;
    diagnosis: string;
    notes?: string;
    instructions: string;
    prescriptionItems: CreatePrescriptionItemRequestDto[];
}

export interface UpdatePrescriptionStatusRequest {
    status: PrescriptionStatus;
}

// Search/filter options
export type PrescriptionSearchOptions = SearchOptions;
