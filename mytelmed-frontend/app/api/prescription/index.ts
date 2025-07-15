import { AxiosResponse } from "axios";
import repository from "../RepositoryManager";
import { ApiResponse, PaginatedResponse } from "../props";
import { PrescriptionDto, CreatePrescriptionRequestDto, PrescriptionSearchOptions } from "./props";

const RESOURCE: string = "/api/v1/prescriptions";
const DEFAULT_PAGE_SIZE: number = 20;

const PrescriptionApi = {
    /**
     * Get prescription by ID (Doctor and Patient)
     */
    getPrescriptionById(prescriptionId: string): Promise<AxiosResponse<ApiResponse<PrescriptionDto>>> {
        return repository.get<ApiResponse<PrescriptionDto>>(`${RESOURCE}/${prescriptionId}`);
    },

    /**
     * Get prescription by prescription number (Patient only)
     */
    getPrescriptionByNumber(prescriptionNumber: string): Promise<AxiosResponse<ApiResponse<PrescriptionDto>>> {
        return repository.get<ApiResponse<PrescriptionDto>>(`${RESOURCE}/number/${prescriptionNumber}`);
    },

    /**
     * Get prescriptions by current account (Patient and Doctor only)
     * Uses intelligent backend filtering based on account type
     */
    getPrescriptions(
        options?: PrescriptionSearchOptions
    ): Promise<AxiosResponse<ApiResponse<PaginatedResponse<PrescriptionDto>>>> {
        const page: number = options?.page ?? 0;
        const size: number = options?.size ?? DEFAULT_PAGE_SIZE;
        const sortBy: string = options?.sortBy ?? "createdAt";
        const sortDirection: string = options?.sortDirection ?? "desc";

        const params = new URLSearchParams({
            page: page.toString(),
            size: size.toString(),
            sort: `${sortBy},${sortDirection}`,
        });

        return repository.get<ApiResponse<PaginatedResponse<PrescriptionDto>>>(`${RESOURCE}?${params}`);
    },

    /**
     * Get prescriptions by patient ID (Patient only - with family permissions)
     */
    getPrescriptionsByPatient(
        patientId: string,
        options?: PrescriptionSearchOptions
    ): Promise<AxiosResponse<ApiResponse<PaginatedResponse<PrescriptionDto>>>> {
        const page: number = options?.page ?? 0;
        const size: number = options?.size ?? DEFAULT_PAGE_SIZE;
        const sortBy: string = options?.sortBy ?? "createdAt";
        const sortDirection: string = options?.sortDirection ?? "desc";

        const params = new URLSearchParams({
            page: page.toString(),
            size: size.toString(),
            sort: `${sortBy},${sortDirection}`,
        });

        return repository.get<ApiResponse<PaginatedResponse<PrescriptionDto>>>(`${RESOURCE}/patient/${patientId}?${params}`);
    },

    /**
     * Get prescriptions by doctor ID (Doctor only)
     */
    getPrescriptionsByDoctor(
        doctorId: string,
        options?: PrescriptionSearchOptions
    ): Promise<AxiosResponse<ApiResponse<PaginatedResponse<PrescriptionDto>>>> {
        const page: number = options?.page ?? 0;
        const size: number = options?.size ?? DEFAULT_PAGE_SIZE;
        const sortBy: string = options?.sortBy ?? "createdAt";
        const sortDirection: string = options?.sortDirection ?? "desc";

        const params = new URLSearchParams({
            page: page.toString(),
            size: size.toString(),
            sort: `${sortBy},${sortDirection}`,
        });

        return repository.get<ApiResponse<PaginatedResponse<PrescriptionDto>>>(`${RESOURCE}/doctor/${doctorId}?${params}`);
    },

    /**
     * Get prescriptions by facility ID (Pharmacist only)
     */
    getPrescriptionsByFacility(
        facilityId: string,
        options?: PrescriptionSearchOptions
    ): Promise<AxiosResponse<ApiResponse<PaginatedResponse<PrescriptionDto>>>> {
        const page: number = options?.page ?? 0;
        const size: number = options?.size ?? DEFAULT_PAGE_SIZE;
        const sortBy: string = options?.sortBy ?? "createdAt";
        const sortDirection: string = options?.sortDirection ?? "desc";

        const params = new URLSearchParams({
            page: page.toString(),
            size: size.toString(),
            sort: `${sortBy},${sortDirection}`,
        });

        // Add status filter if provided
        if (options?.status) {
            params.append("status", options.status);
        }

        return repository.get<ApiResponse<PaginatedResponse<PrescriptionDto>>>(
            `${RESOURCE}/facility/${facilityId}?${params}`
        );
    },

    /**
     * Create new prescription (Doctor only)
     * Validates appointment completion and authorization
     */
    createPrescription(request: CreatePrescriptionRequestDto): Promise<AxiosResponse<ApiResponse<PrescriptionDto>>> {
        return repository.post<ApiResponse<PrescriptionDto>>(`${RESOURCE}`, request);
    },

    /**
     * Patient marks prescription as ready for processing (Patient only)
     * This should be called after patient chooses delivery method
     */
    markAsReadyForProcessing(prescriptionId: string): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.put<ApiResponse<void>>(`${RESOURCE}/${prescriptionId}/ready-for-processing`);
    },

    /**
     * Pharmacist starts processing prescription (Pharmacist only)
     * Validates prescription status and pharmacy authorization
     */
    startProcessing(prescriptionId: string): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.put<ApiResponse<void>>(`${RESOURCE}/${prescriptionId}/start-processing`);
    },

    /**
     * Pharmacist marks prescription as ready/completed (Pharmacist only)
     * Final step in prescription fulfillment workflow
     */
    markAsReady(prescriptionId: string): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.put<ApiResponse<void>>(`${RESOURCE}/${prescriptionId}/complete`);
    },

    /**
     * Doctor marks prescription as expired (Doctor only)
     * Used for prescriptions that are too old to fulfill
     */
    markAsExpired(prescriptionId: string): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.put<ApiResponse<void>>(`${RESOURCE}/${prescriptionId}/expire`);
    },

    /**
     * Doctor cancels prescription (Doctor only)
     * Requires cancellation reason for audit trail
     */
    cancelPrescription(prescriptionId: string, reason: string): Promise<AxiosResponse<ApiResponse<void>>> {
        if (!reason || reason.trim().length === 0) {
            throw new Error("Cancellation reason is required");
        }

        return repository.put<ApiResponse<void>>(`${RESOURCE}/${prescriptionId}/cancel`, reason, {
            headers: { "Content-Type": "text/plain" },
        });
    },

    /**
     * Utility method to check if prescription exists
     * Useful for validation before creating payments or deliveries
     */
    checkPrescriptionExists(prescriptionId: string): Promise<boolean> {
        return this.getPrescriptionById(prescriptionId)
            .then(() => true)
            .catch(() => false);
    },

    /**
     * Get prescription status history/timeline
     * Useful for tracking prescription progress
     */
    getPrescriptionTimeline(prescriptionId: string): Promise<AxiosResponse<ApiResponse<any[]>>> {
        // Note: This endpoint may need to be implemented in backend
        return repository.get<ApiResponse<any[]>>(`${RESOURCE}/${prescriptionId}/timeline`);
    },
};

export default PrescriptionApi;
