import { AxiosResponse } from "axios";
import repository from "../RepositoryManager";
import { ApiResponse } from "../props";
import { Patient, CreatePatientRequest, UpdatePatientProfileRequest, PatientSearchOptions } from "./props";
import { PaginatedResponse } from "../admin/props";

const RESOURCE: string = "/api/v1/patient";
const DEFAULT_PAGE_SIZE: number = 10;

const PatientApi = {
    /**
     * Get all patients with pagination (Admin only)
     */
    getAllPatients(options?: PatientSearchOptions): Promise<AxiosResponse<ApiResponse<PaginatedResponse<Patient>>>> {
        const page: number = options?.page ?? 0;
        const pageSize: number = options?.pageSize ?? DEFAULT_PAGE_SIZE;
        const query: string = `?page=${page}&pageSize=${pageSize}`;
        return repository.get<ApiResponse<PaginatedResponse<Patient>>>(`${RESOURCE}${query}`);
    },

    /**
     * Get patient by ID (Admin only)
     */
    getPatientById(patientId: string): Promise<AxiosResponse<ApiResponse<Patient>>> {
        return repository.get<ApiResponse<Patient>>(`${RESOURCE}/${patientId}`);
    },

    /**
     * Get current patient profile (Patient only)
     */
    getPatientProfile(): Promise<AxiosResponse<ApiResponse<Patient>>> {
        return repository.get<ApiResponse<Patient>>(`${RESOURCE}/profile`);
    },

    /**
     * Register a new patient (Open endpoint)
     */
    createPatient(request: CreatePatientRequest): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.post<ApiResponse<void>>(`${RESOURCE}/register`, request);
    },

    /**
     * Update patient profile (Patient only)
     */
    updatePatientProfile(request: UpdatePatientProfileRequest): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.patch<ApiResponse<void>>(`${RESOURCE}/profile`, request);
    },

    /**
     * Upload patient profile image (Patient only)
     */
    uploadPatientProfileImage(profileImage: File): Promise<AxiosResponse<ApiResponse<void>>> {
        const formData = new FormData();
        formData.append("profileImage", profileImage);
        return repository.put<ApiResponse<void>>(`${RESOURCE}/profile/image`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },

    /**
     * Delete patient (Admin only)
     */
    deletePatient(patientId: string): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.delete<ApiResponse<void>>(`${RESOURCE}/${patientId}`);
    },
};

export default PatientApi;
