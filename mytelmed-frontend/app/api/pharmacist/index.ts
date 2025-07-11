import { AxiosResponse } from "axios";
import repository from "../RepositoryManager";
import { ApiResponse, PaginatedResponse } from "../props";
import {
    Pharmacist,
    CreatePharmacistRequest,
    UpdatePharmacistProfileRequest,
    UpdatePharmacistFacilityRequest,
    PharmacistSearchOptions,
    UpdatePharmacistRequest,
} from "./props";

const RESOURCE: string = "/api/v1/pharmacist";
const DEFAULT_PAGE_SIZE: number = 10;

const PharmacistApi = {
    /**
     * Get all pharmacists with pagination (Admin only)
     */
    getAllPharmacists(
        options?: PharmacistSearchOptions
    ): Promise<AxiosResponse<ApiResponse<PaginatedResponse<Pharmacist>>>> {
        const page: number = options?.page ?? 0;
        const pageSize: number = options?.pageSize ?? DEFAULT_PAGE_SIZE;
        const query: string = `?page=${page}&pageSize=${pageSize}`;
        return repository.get<ApiResponse<PaginatedResponse<Pharmacist>>>(`${RESOURCE}${query}`);
    },

    /**
     * Get pharmacist by ID (Admin only)
     */
    getPharmacistById(pharmacistId: string): Promise<AxiosResponse<ApiResponse<Pharmacist>>> {
        return repository.get<ApiResponse<Pharmacist>>(`${RESOURCE}/${pharmacistId}`);
    },

    /**
     * Get current pharmacist profile (Pharmacist only)
     */
    getPharmacistProfile(): Promise<AxiosResponse<ApiResponse<Pharmacist>>> {
        return repository.get<ApiResponse<Pharmacist>>(`${RESOURCE}/profile`);
    },

    /**
     * Create a new pharmacist (Admin only)
     */
    createPharmacist(request: CreatePharmacistRequest): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.post<ApiResponse<void>>(`${RESOURCE}`, request);
    },

    updatePharmacist(
        pharmacistId: string,
        request: UpdatePharmacistRequest
    ): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.patch<ApiResponse<void>>(`${RESOURCE}/${pharmacistId}`, request);
    },

    /**
     * Update pharmacist profile (Pharmacist only)
     */
    updatePharmacistProfile(request: UpdatePharmacistProfileRequest): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.put<ApiResponse<void>>(`${RESOURCE}/profile`, request);
    },

    /**
     * Upload pharmacist profile image (Pharmacist only)
     */
    updatePharmacistProfileImage(profileImage: File): Promise<AxiosResponse<ApiResponse<void>>> {
        const formData = new FormData();
        formData.append("profileImage", profileImage);
        return repository.put<ApiResponse<void>>(`${RESOURCE}/profile/image`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },

    /**
     * Update pharmacist facility (Admin only)
     */
    updatePharmacistFacility(
        pharmacistId: string,
        request: UpdatePharmacistFacilityRequest
    ): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.patch<ApiResponse<void>>(`${RESOURCE}/${pharmacistId}/facility`, request);
    },

    /**
     * Delete pharmacist (Admin only)
     */
    deletePharmacist(pharmacistId: string): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.delete<ApiResponse<void>>(`${RESOURCE}/${pharmacistId}`);
    },

    /**
     * Activate pharmacist account (Admin only)
     */
    activatePharmacist(pharmacistId: string): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.post<ApiResponse<void>>(`${RESOURCE}/activate/${pharmacistId}`);
    },

    /**
     * Deactivate pharmacist account (Admin only)
     */
    deactivatePharmacist(pharmacistId: string): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.post<ApiResponse<void>>(`${RESOURCE}/deactivate/${pharmacistId}`);
    },

    /**
     * Reset pharmacist account password (Admin only)
     */
    resetPharmacistPassword(pharmacistId: string): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.post<ApiResponse<void>>(`${RESOURCE}/reset/password/${pharmacistId}`);
    },

    /**
     * Upload pharmacist image by ID (Admin only)
     */
    uploadPharmacistImage(pharmacistId: string, profileImage: File): Promise<AxiosResponse<ApiResponse<void>>> {
        const formData = new FormData();
        formData.append("profileImage", profileImage);
        return repository.patch<ApiResponse<void>>(`${RESOURCE}/${pharmacistId}/image`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },
};

export default PharmacistApi;
