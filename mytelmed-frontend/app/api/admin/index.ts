import { AxiosResponse } from "axios";
import repository from "../RepositoryManager";
import { ApiResponse } from "../props";
import { Admin, CreateAdminRequest, UpdateAdminProfileRequest, UpdateAdminRequest } from "./props";
import { PaginatedResponse } from "../props";

const ADMIN_BASE = "/api/v1/admin";

const AdminApi = {
    getProfile(): Promise<AxiosResponse<ApiResponse<Admin>>> {
        return repository.get<ApiResponse<Admin>>(`${ADMIN_BASE}/profile`);
    },

    updateProfile(data: UpdateAdminProfileRequest): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.patch<ApiResponse<void>>(`${ADMIN_BASE}`, data);
    },

    updateProfileImage(profileImage: File): Promise<AxiosResponse<ApiResponse<void>>> {
        const formData = new FormData();
        formData.append("profileImage", profileImage);

        return repository.put<ApiResponse<void>>(`${ADMIN_BASE}/profile/image`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },

    getAllAdmins(page = 0, pageSize = 10): Promise<AxiosResponse<ApiResponse<PaginatedResponse<Admin>>>> {
        return repository.get<ApiResponse<PaginatedResponse<Admin>>>(`${ADMIN_BASE}?page=${page}&pageSize=${pageSize}`);
    },

    getAdminById(adminId: string): Promise<AxiosResponse<ApiResponse<Admin>>> {
        return repository.get<ApiResponse<Admin>>(`${ADMIN_BASE}/${adminId}`);
    },

    createAdmin(data: CreateAdminRequest): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.post<ApiResponse<void>>(`${ADMIN_BASE}`, data);
    },

    updateAdmin(adminId: string, data: UpdateAdminRequest): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.patch<ApiResponse<void>>(`${ADMIN_BASE}/${adminId}`, data);
    },

    deleteAdmin(adminId: string): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.delete<ApiResponse<void>>(`${ADMIN_BASE}/${adminId}`);
    },

    activateAdmin(adminId: string): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.post<ApiResponse<void>>(`${ADMIN_BASE}/activate/${adminId}`);
    },

    deactivateAdmin(adminId: string): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.post<ApiResponse<void>>(`${ADMIN_BASE}/deactivate/${adminId}`);
    },

    resetAdminPassword(adminId: string): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.post<ApiResponse<void>>(`${ADMIN_BASE}/reset/password/${adminId}`);
    },
};

export default AdminApi;
