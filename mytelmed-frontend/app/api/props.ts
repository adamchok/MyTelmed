// Core API Response Types
export interface ApiResponse<T> {
    isSuccess: boolean;
    message: string;
    data?: T;
}

// Comprehensive Pagination Interface
export interface PaginatedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number?: number; // Current page number
    size?: number; // Page size
    first?: boolean; // Is first page
    last?: boolean; // Is last page
}

// Generic Search Options
export interface SearchOptions {
    page?: number;
    pageSize?: number;
    size?: number; // Alternative naming used in some APIs
}

// Stream Integration (used by chat and videocall)
export interface StreamTokenAndUserResponseDto {
    token: string;
    userId: string;
    name: string;
}

// Common Enums
export enum ConsultationMode {
    VIRTUAL = "VIRTUAL",
    PHYSICAL = "PHYSICAL",
}

export enum DocumentType {
    PRESCRIPTION = "PRESCRIPTION",
    LAB_REPORT = "LAB_REPORT",
    RADIOLOGY_REPORT = "RADIOLOGY_REPORT",
    DISCHARGE_SUMMARY = "DISCHARGE_SUMMARY",
    OPERATIVE_REPORT = "OPERATIVE_REPORT",
    CONSULTATION_NOTE = "CONSULTATION_NOTE",
    PROGRESS_NOTE = "PROGRESS_NOTE",
    PATHOLOGY_REPORT = "PATHOLOGY_REPORT",
    IMMUNIZATION_RECORD = "IMMUNIZATION_RECORD",
    REFERRAL_LETTER = "REFERRAL_LETTER",
    MEDICAL_CERTIFICATE = "MEDICAL_CERTIFICATE",
    HISTORY_AND_PHYSICAL = "HISTORY_AND_PHYSICAL",
    EMERGENCY_ROOM_REPORT = "EMERGENCY_ROOM_REPORT",
    ANESTHESIA_RECORD = "ANESTHESIA_RECORD",
    INPATIENT_SUMMARY = "INPATIENT_SUMMARY",
    OUTPATIENT_SUMMARY = "OUTPATIENT_SUMMARY",
    NURSING_NOTE = "NURSING_NOTE",
    MENTAL_HEALTH_NOTE = "MENTAL_HEALTH_NOTE",
    MEDICAL_IMAGING = "MEDICAL_IMAGING",
    CLINICAL_TRIAL_DOCUMENT = "CLINICAL_TRIAL_DOCUMENT",
    TREATMENT_PLAN = "TREATMENT_PLAN",
    DIAGNOSTIC_REPORT = "DIAGNOSTIC_REPORT",
    VITAL_SIGNS_RECORD = "VITAL_SIGNS_RECORD",
    ALLERGY_RECORD = "ALLERGY_RECORD",
    OTHER = "OTHER",
}

export enum AppointmentStatus {
    PENDING = "PENDING",
    PENDING_PAYMENT = "PENDING_PAYMENT",
    CONFIRMED = "CONFIRMED",
    READY_FOR_CALL = "READY_FOR_CALL",
    IN_PROGRESS = "IN_PROGRESS",
    CANCELLED = "CANCELLED",
    COMPLETED = "COMPLETED",
    NO_SHOW = "NO_SHOW",
}

// Common Document Interface
export interface AppointmentDocumentDto {
    id: string;
    documentId: string;
    documentName: string;
    documentType: DocumentType;
    documentUrl: string;
    documentSize: string;
    notes?: string;
    createdAt: string;
}

// Base Entity Interface (common fields across all entities)
export interface BaseEntity {
    id: string;
    createdAt: string;
    updatedAt: string;
}

// Base User Interface (common fields across all user types)
export interface BaseUser extends BaseEntity {
    name: string;
    nric: string;
    email: string;
    phone: string;
    profileImageUrl?: string;
    enabled: boolean;
}

// Extended User Interface (for entities with additional personal info)
export interface ExtendedUser extends BaseUser {
    dateOfBirth: string;
    gender: string;
}
