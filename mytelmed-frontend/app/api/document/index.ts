import { AxiosResponse } from "axios";
import repository from "../RepositoryManager";
import { ApiResponse } from "../props";
import { Document, CreateDocumentRequest, UpdateAccessRequest, UpdateDocumentRequest } from "./props";

const RESOURCE: string = "/api/v1/document";
const ACCESS_RESOURCE: string = "/api/v1/document/access";

const DocumentApi = {
    /**
     * Get document by ID (Patient only)
     */
    getDocumentById(documentId: string): Promise<AxiosResponse<ApiResponse<Document>>> {
        return repository.get<ApiResponse<Document>>(`${RESOURCE}/${documentId}`);
    },

    /**
     * Get all documents for current patient account (Patient only)
     */
    getDocumentsByPatientAccount(): Promise<AxiosResponse<ApiResponse<Document[]>>> {
        return repository.get<ApiResponse<Document[]>>(`${RESOURCE}`);
    },

    /**
     * Get all documents for a specific patient ID (Patient only)
     */
    getDocumentsByPatientId(patientId: string): Promise<AxiosResponse<ApiResponse<Document[]>>> {
        return repository.get<ApiResponse<Document[]>>(`${RESOURCE}/patient/${patientId}`);
    },

    /**
     * Create a new document (Patient only)
     */
    createDocument(request: CreateDocumentRequest): Promise<AxiosResponse<ApiResponse<string>>> {
        return repository.post<ApiResponse<string>>(`${RESOURCE}`, request);
    },

    /**
     * Upload document file (Patient only)
     */
    uploadDocument(documentId: string, file: File): Promise<AxiosResponse<ApiResponse<void>>> {
        const formData = new FormData();
        formData.append("file", file);
        return repository.put<ApiResponse<void>>(`${RESOURCE}/${documentId}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },

    /**
     * Create document and upload file in one operation (Patient only)
     */
    async createAndUploadDocument(
        request: CreateDocumentRequest,
        file: File
    ): Promise<AxiosResponse<ApiResponse<void>>> {
        try {
            // First, create the document
            const createResponse = await this.createDocument(request);

            if (createResponse.data.isSuccess && createResponse.data.data) {
                const documentId = createResponse.data.data;

                // Then, upload the file using the returned document ID
                return await this.uploadDocument(documentId, file);
            } else {
                throw new Error(createResponse.data.message || "Failed to create document");
            }
        } catch (error) {
            console.error("Error creating and uploading document:", error);
            throw error;
        }
    },

    /**
     * Update document metadata and optionally file (Patient only)
     */
    updateDocument(documentId: string, request: UpdateDocumentRequest): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.patch<ApiResponse<void>>(`${RESOURCE}/${documentId}`, request);
    },

    /**
     * Delete document (Patient only)
     */
    deleteDocument(documentId: string): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.delete<ApiResponse<void>>(`${RESOURCE}/${documentId}`);
    },

    /**
     * Update document access permissions (Patient only)
     */
    updateDocumentAccess(documentId: string, request: UpdateAccessRequest): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.patch<ApiResponse<void>>(`${ACCESS_RESOURCE}/${documentId}`, request);
    },

    /**
     * Revoke all access for a document (Patient only)
     */
    revokeAllAccessForDocument(documentId: string): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.patch<ApiResponse<void>>(`${ACCESS_RESOURCE}/${documentId}/all`);
    },
};

export default DocumentApi;
