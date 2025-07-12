import { BaseEntity, DocumentType } from "../props";
import { Patient } from "../patient/props";

// Document Access DTO
export interface DocumentAccess {
    id: string;
    canView: boolean;
    canAttach: boolean;
    expiryDate: string;
}

// Document DTO
export interface Document extends BaseEntity {
    documentName: string;
    documentType: DocumentType;
    documentSize: string;
    documentUrl: string;
    documentAccess: DocumentAccess;
    patient: Patient;
}

// Create Document Request DTO
export interface CreateDocumentRequest {
    documentName: string;
    documentType: DocumentType;
}

// Update Document Request DTO
export interface UpdateDocumentRequest {
    documentName: string;
}

// Update Access Request DTO
export interface UpdateAccessRequest {
    canView: boolean;
    canAttach: boolean;
    expiryDate: string;
}

// Document Search Options
export interface DocumentSearchOptions {
    page?: number;
    pageSize?: number;
    documentType?: DocumentType;
    patientId?: string;
}
