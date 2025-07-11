import { AxiosResponse } from "axios";
import repository from "../RepositoryManager";
import { ApiResponse, PaginatedResponse } from "../props";
import { Doctor, CreateDoctorRequest, UpdateDoctorProfileRequest, UpdateDoctorRequest } from "./props";

const DOCTOR_BASE = "/api/v1/doctor";

const DoctorApi = {
    // Get all doctors (paginated) - matches GET /api/v1/doctor
    getDoctors(page = 0, pageSize = 10): Promise<AxiosResponse<ApiResponse<PaginatedResponse<Doctor>>>> {
        return repository.get<ApiResponse<PaginatedResponse<Doctor>>>(
            `${DOCTOR_BASE}?page=${page}&pageSize=${pageSize}`
        );
    },

    // Get doctors by facility ID - matches GET /api/v1/doctor/facility/{facilityId}
    getDoctorsByFacility(
        facilityId: string,
        page = 0,
        pageSize = 10
    ): Promise<AxiosResponse<ApiResponse<PaginatedResponse<Doctor>>>> {
        return repository.get<ApiResponse<PaginatedResponse<Doctor>>>(
            `${DOCTOR_BASE}/facility/${facilityId}?page=${page}&pageSize=${pageSize}`
        );
    },

    // Get doctor by ID - matches GET /api/v1/doctor/{doctorId}
    getDoctorById(doctorId: string): Promise<AxiosResponse<ApiResponse<Doctor>>> {
        return repository.get<ApiResponse<Doctor>>(`${DOCTOR_BASE}/${doctorId}`);
    },

    // Get current doctor profile - matches GET /api/v1/doctor/profile
    getDoctorProfile(): Promise<AxiosResponse<ApiResponse<Doctor>>> {
        return repository.get<ApiResponse<Doctor>>(`${DOCTOR_BASE}/profile`);
    },

    // Create doctor - matches POST /api/v1/doctor
    createDoctor(data: CreateDoctorRequest): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.post<ApiResponse<void>>(`${DOCTOR_BASE}`, data);
    },

    updateDoctor(doctorId: string, data: UpdateDoctorRequest): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.patch<ApiResponse<void>>(`${DOCTOR_BASE}/${doctorId}`, data);
    },

    // Update doctor profile - matches PATCH /api/v1/doctor/profile
    updateDoctorProfile(data: UpdateDoctorProfileRequest): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.patch<ApiResponse<void>>(`${DOCTOR_BASE}/profile`, data);
    },

    // Update doctor profile image - matches PUT /api/v1/doctor/profile/image
    updateDoctorProfileImage(profileImage: File): Promise<AxiosResponse<ApiResponse<void>>> {
        const formData = new FormData();
        formData.append("profileImage", profileImage);
        return repository.put<ApiResponse<void>>(`${DOCTOR_BASE}/profile/image`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },

    // Upload doctor image - matches POST /api/v1/doctor/image/{doctorId}
    uploadDoctorImage(doctorId: string, profileImage: File): Promise<AxiosResponse<ApiResponse<void>>> {
        const formData = new FormData();
        formData.append("profileImage", profileImage);
        return repository.post<ApiResponse<void>>(`${DOCTOR_BASE}/image/${doctorId}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },

    // Activate doctor - matches POST /api/v1/doctor/activate/{doctorId}
    activateDoctor(doctorId: string): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.post<ApiResponse<void>>(`${DOCTOR_BASE}/activate/${doctorId}`);
    },

    // Deactivate doctor - matches POST /api/v1/doctor/deactivate/{doctorId}
    deactivateDoctor(doctorId: string): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.post<ApiResponse<void>>(`${DOCTOR_BASE}/deactivate/${doctorId}`);
    },

    // Reset doctor password - matches POST /api/v1/doctor/reset/password/{doctorId}
    resetDoctorPassword(doctorId: string): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.post<ApiResponse<void>>(`${DOCTOR_BASE}/reset/password/${doctorId}`);
    },
};

export default DoctorApi;
