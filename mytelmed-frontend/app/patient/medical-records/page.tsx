"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import DocumentApi from "@/app/api/document";
import PatientApi from "@/app/api/patient";
import { FamilyMemberApi } from "@/app/api/family";
import { Document, CreateDocumentRequest, UpdateAccessRequest } from "@/app/api/document/props";
import { DocumentType } from "@/app/api/props";
import { FamilyMember } from "@/app/api/family/props";
import { DocumentsFilterOptions, PatientOption } from "./props";
import MedicalRecordsComponent from "./component";
import dayjs from "dayjs";

const ITEMS_PER_PAGE = 10;

const MedicalRecordsPage = () => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);

    const [searchQuery, setSearchQuery] = useState<string>("");
    const [filters, setFilters] = useState<DocumentsFilterOptions>({});

    // Patient selection state
    const [patientOptions, setPatientOptions] = useState<PatientOption[]>([]);
    const [selectedPatientId, setSelectedPatientId] = useState<string>("");
    const [currentPatientId, setCurrentPatientId] = useState<string>("");
    const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);

    // Fetch patient options (self + family members with document viewing permission)
    const fetchPatientOptions = useCallback(async () => {
        try {
            setError(null);

            // Get current patient profile
            const profileResponse = await PatientApi.getPatientProfile();
            if (!profileResponse.data?.isSuccess || !profileResponse.data.data) {
                throw new Error("Failed to load patient profile");
            }

            const currentPatient = profileResponse.data.data;
            setCurrentPatientId(currentPatient.id);

            // Initialize options with current patient
            const options: PatientOption[] = [
                {
                    id: currentPatient.id,
                    name: "You",
                    relationship: "You",
                    canViewDocuments: true,
                },
            ];

            // Get family members
            try {
                const familyResponse = await FamilyMemberApi.getPatientsByMemberAccount();
                if (familyResponse.data?.isSuccess && familyResponse.data.data) {
                    const familyMembersList = familyResponse.data.data;
                    setFamilyMembers(familyMembersList);

                    // Add family members with document viewing permission
                    familyMembersList.forEach((member: FamilyMember) => {
                        if (!member.pending && member.canViewMedicalRecords && member.patient) {
                            options.push({
                                id: member.patient.id,
                                name: member.name,
                                relationship: member.relationship,
                                canViewDocuments: true,
                            });
                        }
                    });
                }
            } catch (familyError) {
                console.warn("Failed to fetch family members:", familyError);
                // Continue without family members
            }

            setPatientOptions(options);

            // Set default selection to current patient if not already set
            if (!selectedPatientId && options.length > 0) {
                setSelectedPatientId(currentPatient.id);
            }
        } catch (err: any) {
            console.error("Failed to fetch patient options:", err);
            setError(err.response?.data?.message || "Failed to load patient options. Please try again.");
        }
    }, [selectedPatientId]);

    // Fetch documents for selected patient
    const fetchDocuments = useCallback(async () => {
        if (!selectedPatientId) return;

        try {
            setIsLoading(true);
            setError(null);

            let documentsResponse;

            // Fetch documents based on whether viewing own or family member's documents
            if (selectedPatientId === currentPatientId) {
                documentsResponse = await DocumentApi.getDocumentsByPatientAccount();
            } else {
                documentsResponse = await DocumentApi.getDocumentsByPatientId(selectedPatientId);
            }

            if (documentsResponse.data?.isSuccess && documentsResponse.data.data) {
                const documentsList = documentsResponse.data.data;

                // Filter out expired documents for family members
                let filteredDocuments = documentsList;
                if (selectedPatientId !== currentPatientId) {
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
    }, [selectedPatientId, currentPatientId]);

    // Initial load
    useEffect(() => {
        fetchPatientOptions();
    }, [fetchPatientOptions]);

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
    const isViewingOwnDocuments = selectedPatientId === currentPatientId;

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
        await Promise.all([fetchPatientOptions(), fetchDocuments()]);
    }, [fetchPatientOptions, fetchDocuments]);

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
            patientOptions={patientOptions}
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
