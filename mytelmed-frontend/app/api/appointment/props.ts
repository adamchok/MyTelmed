import { Patient } from "../patient/props";
import { Doctor } from "../doctor/props";
import { ConsultationMode, AppointmentStatus, DocumentType, AppointmentDocumentDto, SearchOptions } from "../props";
import { TranscriptionSummaryDto } from "../transcription/props";

// Re-export commonly used enums for convenience
export { ConsultationMode, AppointmentStatus, DocumentType };

// Document Request DTO
export interface AddAppointmentDocumentRequestDto {
    documentId: string;
    notes?: string;
}

// Main Appointment DTO - matches backend AppointmentDto
export interface AppointmentDto {
    id: string;
    patient: Patient;
    doctor: Doctor; // Fixed: was "provider" but backend returns "doctor"
    appointmentDateTime: string; // LocalDateTime as ISO string
    durationMinutes: number;
    status: string; // AppointmentStatus as string
    consultationMode: ConsultationMode;
    patientNotes?: string;
    doctorNotes?: string;
    reasonForVisit?: string;
    cancellationReason?: string;
    cancelledBy?: string;
    completedAt?: string;
    attachedDocuments: AppointmentDocumentDto[];
    transcriptionSummary?: TranscriptionSummaryDto; // AI-generated transcription summary
    hasAttachedDocuments: boolean; // Added: convenience field for UI
    createdAt: string;
    updatedAt: string;
}

// Request DTOs
export interface BookAppointmentRequestDto {
    doctorId: string;
    patientId: string;
    timeSlotId: string;
    consultationMode: ConsultationMode;
    patientNotes?: string;
    reasonForVisit?: string;
    documentRequestList?: AddAppointmentDocumentRequestDto[];
}

export interface UpdateAppointmentRequestDto {
    patientNotes?: string;
    reasonForVisit?: string;
    documentRequestList?: AddAppointmentDocumentRequestDto[];
}

// Cancel Appointment Request DTO - matches backend CancelAppointmentRequestDto
export interface CancelAppointmentRequestDto {
    reason?: string;
}

// Search/filter options
export type AppointmentSearchOptions = SearchOptions;
