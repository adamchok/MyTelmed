import { Patient } from "../patient/props";
import { Doctor } from "../doctor/props";
import { ConsultationMode, AppointmentStatus, DocumentType, AppointmentDocumentDto, SearchOptions } from "../props";

// Re-export commonly used enums for convenience
export { ConsultationMode, AppointmentStatus, DocumentType };

// Document Request DTO
export interface AddAppointmentDocumentRequestDto {
    documentId: string;
    notes?: string;
}

// Main Appointment DTO
export interface AppointmentDto {
    id: string;
    patient: Patient;
    doctor: Doctor;
    appointmentDateTime: string; // LocalDateTime as ISO string
    durationMinutes: number;
    status: string; // AppointmentStatus as string
    consultationMode: ConsultationMode;
    patientNotes?: string;
    doctorNotes?: string;
    reasonForVisit?: string;
    cancellationReason?: string;
    completedAt?: string;
    attachedDocuments: AppointmentDocumentDto[];
    createdAt: string;
    updatedAt: string;
}

// Request DTOs
export interface BookAppointmentRequestDto {
    doctorId: string;
    timeSlotId: string;
    consultationMode: ConsultationMode;
    patientNotes?: string;
    reasonForVisit?: string;
    documentRequestList?: AddAppointmentDocumentRequestDto[];
}

export interface UpdateAppointmentRequestDto {
    patientNotes?: string;
    nutritionistNotes?: string;
    reasonForVisit?: string;
    documentRequestList?: AddAppointmentDocumentRequestDto[];
}

// Search/filter options
export type AppointmentSearchOptions = SearchOptions;
