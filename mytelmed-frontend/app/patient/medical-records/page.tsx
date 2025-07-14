"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import DocumentApi from "@/app/api/document";
import { Document, CreateDocumentRequest, UpdateAccessRequest } from "@/app/api/document/props";
import { DocumentType } from "@/app/api/props";
import { DocumentsFilterOptions, PatientOption } from "./props";
import MedicalRecordsComponent from "./component";
import { useFamilyPermissions } from "@/app/hooks/useFamilyPermissions";
import dayjs from "dayjs";

const ITEMS_PER_PAGE = 10;

const MedicalRecordsPage = () => {
    // Family permissions hook
    const {
        getAuthorizedPatientsForMedicalRecords,
        getPatientOption,
        currentPatient,
        familyMembers,
        loading: familyLoading
    } = useFamilyPermissions();

    const [documents, setDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);

    const [searchQuery, setSearchQuery] = useState<string>("");
    const [filters, setFilters] = useState<DocumentsFilterOptions>({});

    // Patient selection state
    const [selectedPatientId, setSelectedPatientId] = useState<string>("");

    // Get patient options from hook
    const getPatientOptions = (): PatientOption[] => {
        const authorizedPatients = getAuthorizedPatientsForMedicalRecords();
        return authorizedPatients.map(patient => {
            const option = getPatientOption(patient.id);
            return {
                id: patient.id,
                name: option?.name || patient.name,
                relationship: option?.relationship || "Unknown",
                canViewDocuments: true, // Already filtered by hook
            };
        });
    };

    // Set default patient selection when hook loads
    useEffect(() => {
        if (!familyLoading && currentPatient && !selectedPatientId) {
            setSelectedPatientId(currentPatient.id);
        }
    }, [familyLoading, currentPatient, selectedPatientId]);

    // Fetch documents for selected patient
    const fetchDocuments = useCallback(async () => {
        if (!selectedPatientId) return;

        try {
            setIsLoading(true);
            setError(null);

            let documentsResponse;

            // Fetch documents based on whether viewing own or family member's documents
            if (selectedPatientId === currentPatient?.id) {
                documentsResponse = await DocumentApi.getDocumentsByPatientAccount();
            } else {
                documentsResponse = await DocumentApi.getDocumentsByPatientId(selectedPatientId);
            }

            if (documentsResponse.data?.isSuccess && documentsResponse.data.data) {
                const documentsList = documentsResponse.data.data;

                // Filter out expired documents for family members
                let filteredDocuments = documentsList;
                if (selectedPatientId !== currentPatient?.id) {
                    filteredDocuments = documentsList.filter((doc: Document) => {
                        // Only show documents with view access
                        if (!doc.documentAccess.canView) return false;

                        // Check if access is expired
                        if (doc.documentAccess.expiryDate) {
                            const expiryDate = dayjs(doc.documentAccess.expiryDate);
                            const today = dayjs();
                            return expiryDate.isAfter(today);
                        }

                        return true;
                    });
                }

                setDocuments(filteredDocuments);
            } else {
                setError("Failed to load documents");
            }
        } catch (err: any) {
            console.error("Failed to fetch documents:", err);
            setError(err.response?.data?.message || "Failed to load documents. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [selectedPatientId, currentPatient?.id]);

    // Fetch documents when patient selection changes
    useEffect(() => {
        if (selectedPatientId) {
            fetchDocuments();
        }
    }, [fetchDocuments, selectedPatientId]);

    // Define document type options
    const documentTypeOptions = [
        { label: "Prescription", value: DocumentType.PRESCRIPTION },
        { label: "Lab Report", value: DocumentType.LAB_REPORT },
        { label: "Radiology Report", value: DocumentType.RADIOLOGY_REPORT },
        { label: "Discharge Summary", value: DocumentType.DISCHARGE_SUMMARY },
        { label: "Operative Report", value: DocumentType.OPERATIVE_REPORT },
        { label: "Consultation Note", value: DocumentType.CONSULTATION_NOTE },
        { label: "Progress Note", value: DocumentType.PROGRESS_NOTE },
        { label: "Pathology Report", value: DocumentType.PATHOLOGY_REPORT },
        { label: "Immunization Record", value: DocumentType.IMMUNIZATION_RECORD },
        { label: "Referral Letter", value: DocumentType.REFERRAL_LETTER },
        { label: "Medical Certificate", value: DocumentType.MEDICAL_CERTIFICATE },
        { label: "Other", value: DocumentType.OTHER },
    ];

    // Helper functions for filtering
    const matchesSearchQuery = useCallback(
        (document: Document) => {
            if (!searchQuery) return true;
            const query = searchQuery.toLowerCase();
            return (
                document.documentName.toLowerCase().includes(query) ||
                document.documentType.toLowerCase().includes(query) ||
                document.patient.name.toLowerCase().includes(query)
            );
        },
        [searchQuery]
    );

    const matchesFilters = useCallback(
        (document: Document) => {
            const matchesDocumentType = filters.documentType?.length
                ? filters.documentType.includes(document.documentType)
                : true;

            const matchesDateRange =
                filters.dateRange?.[0] && filters.dateRange?.[1]
                    ? new Date(document.createdAt) >= new Date(filters.dateRange[0]) &&
                    new Date(document.createdAt) <= new Date(filters.dateRange[1])
                    : true;

            return matchesDocumentType && matchesDateRange;
        },
        [filters]
    );

    // Filter the documents based on search query and filters
    const filteredDocuments = useMemo(() => {
        return documents.filter((document) => matchesSearchQuery(document) && matchesFilters(document));
    }, [documents, matchesSearchQuery, matchesFilters]);

    // Paginate filtered documents
    const paginatedDocuments = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return filteredDocuments.slice(startIndex, endIndex);
    }, [filteredDocuments, currentPage]);

    // Calculate total pages
    const totalPages = Math.ceil(filteredDocuments.length / ITEMS_PER_PAGE) || 1;

    // Check if viewing own documents
    const isViewingOwnDocuments = selectedPatientId === currentPatient?.id;

    // Handler functions
    const handleUploadDocument = useCallback(
        async (request: CreateDocumentRequest, file: File) => {
            try {
                await DocumentApi.createAndUploadDocument(request, file);
                await fetchDocuments(); // Refresh the list
            } catch (error) {
                console.error("Upload failed:", error);
                throw error;
            }
        },
        [fetchDocuments]
    );

    const handleDeleteDocument = useCallback(
        async (documentId: string) => {
            try {
                await DocumentApi.deleteDocument(documentId);
                await fetchDocuments(); // Refresh the list
            } catch (error: any) {
                console.error("Delete failed:", error);
                throw new Error(error.response?.data?.message || "Failed to delete document");
            }
        },
        [fetchDocuments]
    );

    const handleUpdateDocument = useCallback(
        async (documentId: string, request: { documentName: string }) => {
            try {
                console.log("Updating document:", documentId, "with request:", request); // Debug log
                await DocumentApi.updateDocument(documentId, request);
                await fetchDocuments(); // Refresh the list
            } catch (error: any) {
                console.error("Update failed:", error);
                console.error("Error response:", error.response?.data); // Debug log
                throw new Error(error.response?.data?.message || "Failed to update document");
            }
        },
        [fetchDocuments]
    );

    const handleUpdateAccess = useCallback(
        async (documentId: string, request: UpdateAccessRequest) => {
            try {
                console.log("Updating access for document:", documentId, "with request:", request); // Debug log
                await DocumentApi.updateDocumentAccess(documentId, request);
                await fetchDocuments(); // Refresh the list
            } catch (error: any) {
                console.error("Access update failed:", error);
                console.error("Error response:", error.response?.data); // Debug log
                throw new Error(error.response?.data?.message || "Failed to update document access");
            }
        },
        [fetchDocuments]
    );

    const handleRevokeAllAccess = useCallback(
        async (documentId: string) => {
            try {
                console.log("Revoking all access for document:", documentId); // Debug log
                await DocumentApi.revokeAllAccessForDocument(documentId);
                await fetchDocuments(); // Refresh the list
            } catch (error: any) {
                console.error("Revoke access failed:", error);
                console.error("Error response:", error.response?.data); // Debug log
                throw new Error(error.response?.data?.message || "Failed to revoke document access");
            }
        },
        [fetchDocuments]
    );

    // Handle search change
    const handleSearchChange = useCallback((query: string) => {
        setSearchQuery(query);
        setCurrentPage(1); // Reset to first page when search changes
    }, []);

    // Handle filter change
    const handleFilterChange = useCallback((newFilters: Partial<DocumentsFilterOptions>) => {
        setFilters((prev) => ({ ...prev, ...newFilters }));
        setCurrentPage(1); // Reset to first page when filters change
    }, []);

    // Handle page change
    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
    }, []);

    // Handle patient change
    const handlePatientChange = useCallback((patientId: string) => {
        setSelectedPatientId(patientId);
        setCurrentPage(1); // Reset to first page when patient changes
        setSearchQuery(""); // Clear search when patient changes
        setFilters({}); // Clear filters when patient changes
    }, []);

    // Handle refresh
    const handleRefresh = useCallback(async () => {
        await fetchDocuments();
    }, [fetchDocuments]);

    return (
        <MedicalRecordsComponent
            documents={documents}
            filteredDocuments={paginatedDocuments}
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={ITEMS_PER_PAGE}
            totalItems={filteredDocuments.length}
            filters={filters}
            documentTypeOptions={documentTypeOptions}
            searchQuery={searchQuery}
            patientOptions={getPatientOptions()}
            selectedPatientId={selectedPatientId}
            isViewingOwnDocuments={isViewingOwnDocuments}
            onUploadDocument={handleUploadDocument}
            onDeleteDocument={handleDeleteDocument}
            onUpdateDocument={handleUpdateDocument}
            onUpdateAccess={handleUpdateAccess}
            onRevokeAllAccess={handleRevokeAllAccess}
            onSearchChange={handleSearchChange}
            onFilterChange={handleFilterChange}
            onPageChange={handlePageChange}
            onPatientChange={handlePatientChange}
            onRefresh={handleRefresh}
            isLoading={isLoading}
            error={error}
            familyMembers={familyMembers}
        />
    );
};

export default MedicalRecordsPage;
