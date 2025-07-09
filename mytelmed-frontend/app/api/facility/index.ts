import { FacilitySearchOptions, CreateFacilityRequest, UpdateFacilityRequest, Facility } from "./props";
import repository from "../RepositoryManager";
import { ApiResponse, PaginatedResponse } from "../props";
import { AxiosResponse } from "axios";

const RESOURCE: string = "/api/v1/facility";
const DEFAULT_PAGE_SIZE: number = 10;

const FacilityApi = {
    /**
     * Get all facilities with pagination
     */
    findFacilities(options?: FacilitySearchOptions): Promise<AxiosResponse<ApiResponse<PaginatedResponse<Facility>>>> {
        const page: number = options?.page ?? 0;
        const pageSize: number = options?.pageSize ?? DEFAULT_PAGE_SIZE;
        const query: string = `?page=${page}&pageSize=${pageSize}`;
        return repository.get<ApiResponse<PaginatedResponse<Facility>>>(`${RESOURCE}${query}`);
    },

    /**
     * Get all facilities with no pagination (Admin only)
     */
    findAllFacilities(): Promise<AxiosResponse<ApiResponse<Facility[]>>> {
        return repository.get<ApiResponse<Facility[]>>(`${RESOURCE}/all`);
    },

    /**
     * Get facility by ID
     */
    getFacilityById(facilityId: string): Promise<AxiosResponse<ApiResponse<Facility>>> {
        return repository.get<ApiResponse<Facility>>(`${RESOURCE}/${facilityId}`);
    },

    /**
     * Create a new facility
     */
    createFacility(request: CreateFacilityRequest): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.post<ApiResponse<void>>(`${RESOURCE}`, request);
    },

    /**
     * Update an existing facility
     */
    updateFacility(facilityId: string, request: UpdateFacilityRequest): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.patch<ApiResponse<void>>(`${RESOURCE}/${facilityId}`, request);
    },

    /**
     * Delete a facility
     */
    deleteFacility(facilityId: string): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.delete<ApiResponse<void>>(`${RESOURCE}/${facilityId}`);
    },

    /**
     * Upload thumbnail image for a facility
     */
    uploadImage(facilityId: string, file: File): Promise<AxiosResponse<ApiResponse<void>>> {
        const formData = new FormData();
        formData.append("file", file);
        return repository.post<ApiResponse<void>>(`${RESOURCE}/image/${facilityId}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },
};

export default FacilityApi;
