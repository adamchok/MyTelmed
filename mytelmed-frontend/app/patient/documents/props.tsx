import { Document, CreateDocumentRequest, UpdateAccessRequest } from "@/app/api/document/props";
import { DocumentType } from "@/app/api/props";
import { FamilyMember } from "@/app/api/family/props";

// Patient selection option for dropdown
export interface PatientOption {
    id: string;
    name: string;
    relationship: string; // "You" for self, or actual relationship for family members
    canViewDocuments: boolean;
}

// Filter options for documents
export interface DocumentsFilterOptions {
    documentType?: DocumentType[];
    dateRange?: [string, string]; // [startDate, endDate]
    searchQuery?: string;
}

export interface MedicalRecordsPageProps {
    documents: Document[];
}

export interface MedicalRecordsComponentProps {
    // Data props
    documents: Document[];
    filteredDocuments: Document[];

    // Pagination props
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    totalItems: number;

    // Filter props
    filters: DocumentsFilterOptions;
    documentTypeOptions: { label: string; value: DocumentType }[];

    // Search props
    searchQuery: string;

    // Patient selection props
    patientOptions: PatientOption[];
    selectedPatientId: string;
    isViewingOwnDocuments: boolean;

    // Handler functions
    onUploadDocument: (request: CreateDocumentRequest, file: File) => Promise<void>;
    onDeleteDocument: (documentId: string) => Promise<void>;
    onUpdateDocument: (documentId: string, request: { documentName: string }) => Promise<void>;
    onUpdateAccess: (documentId: string, request: UpdateAccessRequest) => Promise<void>;
    onRevokeAllAccess: (documentId: string) => Promise<void>;

    // Filter handlers
    onSearchChange: (query: string) => void;
    onFilterChange: (newFilters: Partial<DocumentsFilterOptions>) => void;
    onPageChange: (page: number) => void;
    onPatientChange: (patientId: string) => void;
    onRefresh: () => Promise<void>;

    // Loading state
    isLoading: boolean;
    error: string | null;

    // Family members data for sharing
    familyMembers: FamilyMember[];
}

export interface DocumentCardProps {
    document: Document;
    isViewingOwnDocuments: boolean;
    onDelete: (documentId: string) => void;
    onUpdate: (documentId: string, updates: { documentName: string }) => void;
    onUpdateAccess: (documentId: string) => void;
    onRevokeAllAccess: (documentId: string) => void;
    onDownload: (documentId: string) => void;
    onAddToComparison?: (document: Document) => void;
    onRemoveFromComparison?: (document: Document) => void;
    isSelected?: boolean;
    canSelectForComparison?: boolean;
}

export interface DocumentUploadProps {
    onUpload: (request: CreateDocumentRequest, file: File) => Promise<void>;
    isVisible: boolean;
    onVisibleChange: (visible: boolean) => void;
    isLoading?: boolean;
}

export interface AccessModalProps {
    document: Document;
    isVisible: boolean;
    onClose: () => void;
    onUpdateAccess: (documentId: string, request: UpdateAccessRequest) => Promise<void>;
    onRevokeAllAccess: (documentId: string) => Promise<void>;
}

export interface EditDocumentModalProps {
    document: Document;
    isVisible: boolean;
    onClose: () => void;
    onUpdate: (documentId: string, request: { documentName: string }) => Promise<void>;
}

export interface DocumentDetailModalProps {
    document: Document | null;
    isVisible: boolean;
    onClose: () => void;
    isViewingOwnDocuments: boolean;
}
