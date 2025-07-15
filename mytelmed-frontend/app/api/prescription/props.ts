import { Pharmacist } from "../pharmacist/props";
import { AppointmentDto } from "../appointment/props";
import { SearchOptions } from "../props";
import { MedicationDeliverySimpleDto } from "../delivery/props";

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
    prescriptionItems: PrescriptionItemDto[];
    expiryDate: string;
    createdAt: string;
    updatedAt: string;
    delivery?: MedicationDeliverySimpleDto;
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

// Enhanced search/filter options for prescriptions
export interface PrescriptionSearchOptions extends SearchOptions {
    sortBy?: string;
    sortDirection?: "asc" | "desc";
    status?: PrescriptionStatus;
    patientId?: string;
    doctorId?: string;
    facilityId?: string;
    startDate?: string;
    endDate?: string;
    searchQuery?: string;
}
