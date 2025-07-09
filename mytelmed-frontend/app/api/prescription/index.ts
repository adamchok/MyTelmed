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
     * Get prescriptions by patient ID (Patient only)
     */
    getPrescriptionsByPatient(
        patientId: string,
        options?: PrescriptionSearchOptions
    ): Promise<AxiosResponse<ApiResponse<PaginatedResponse<PrescriptionDto>>>> {
        const page: number = options?.page ?? 0;
        const size: number = options?.size ?? DEFAULT_PAGE_SIZE;
        const query: string = `?page=${page}&size=${size}`;
        return repository.get<ApiResponse<PaginatedResponse<PrescriptionDto>>>(`${RESOURCE}/patient/${patientId}${query}`);
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
        const query: string = `?page=${page}&size=${size}`;
        return repository.get<ApiResponse<PaginatedResponse<PrescriptionDto>>>(`${RESOURCE}/doctor/${doctorId}${query}`);
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
        const query: string = `?page=${page}&size=${size}`;
        return repository.get<ApiResponse<PaginatedResponse<PrescriptionDto>>>(`${RESOURCE}/facility/${facilityId}${query}`);
    },

    /**
     * Create new prescription (Doctor only)
     */
    createPrescription(request: CreatePrescriptionRequestDto): Promise<AxiosResponse<ApiResponse<PrescriptionDto>>> {
        return repository.post<ApiResponse<PrescriptionDto>>(`${RESOURCE}`, request);
    },

    /**
     * Patient marks prescription as ready for processing (Patient only)
     */
    markAsReadyForProcessing(prescriptionId: string): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.put<ApiResponse<void>>(`${RESOURCE}/${prescriptionId}/ready-for-processing`);
    },

    /**
     * Pharmacist starts processing prescription (Pharmacist only)
     */
    startProcessing(prescriptionId: string): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.put<ApiResponse<void>>(`${RESOURCE}/${prescriptionId}/start-processing`);
    },

    /**
     * Pharmacist marks prescription as ready/completed (Pharmacist only)
     */
    markAsReady(prescriptionId: string): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.put<ApiResponse<void>>(`${RESOURCE}/${prescriptionId}/complete`);
    },

    /**
     * Doctor marks prescription as expired (Doctor only)
     */
    markAsExpired(prescriptionId: string): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.put<ApiResponse<void>>(`${RESOURCE}/${prescriptionId}/expire`);
    },

    /**
     * Doctor cancels prescription (Doctor only)
     */
    cancelPrescription(prescriptionId: string, reason: string): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.put<ApiResponse<void>>(`${RESOURCE}/${prescriptionId}/cancel`, reason, {
            headers: { "Content-Type": "text/plain" },
        });
    },
};

export default PrescriptionApi;
