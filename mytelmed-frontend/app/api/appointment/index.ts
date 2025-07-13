import { AxiosResponse } from "axios";
import repository from "../RepositoryManager";
import { ApiResponse, PaginatedResponse } from "../props";
import {
    AppointmentDto,
    BookAppointmentRequestDto,
    UpdateAppointmentRequestDto,
    CancelAppointmentRequestDto,
    AppointmentSearchOptions,
} from "./props";

const RESOURCE: string = "/api/v1/appointment";
const DEFAULT_PAGE_SIZE: number = 10;

const AppointmentApi = {
    /**
     * Get appointment by ID (All authenticated users)
     */
    getAppointmentById(appointmentId: string): Promise<AxiosResponse<ApiResponse<AppointmentDto>>> {
        return repository.get<ApiResponse<AppointmentDto>>(`${RESOURCE}/${appointmentId}`);
    },

    /**
     * Get appointments by account with pagination (All authenticated users)
     */
    getAppointmentsByAccount(
        options?: AppointmentSearchOptions
    ): Promise<AxiosResponse<ApiResponse<PaginatedResponse<AppointmentDto>>>> {
        const page: number = options?.page ?? 0;
        const pageSize: number = options?.pageSize ?? DEFAULT_PAGE_SIZE;
        const query: string = `?page=${page}&pageSize=${pageSize}`;
        return repository.get<ApiResponse<PaginatedResponse<AppointmentDto>>>(`${RESOURCE}${query}`);
    },

    /**
     * Get all appointments by account without pagination (All authenticated users)
     */
    getAllAppointmentsByAccount(): Promise<AxiosResponse<ApiResponse<AppointmentDto[]>>> {
        return repository.get<ApiResponse<AppointmentDto[]>>(`${RESOURCE}/list`);
    },

    /**
     * Book new appointment (Patient only)
     */
    bookAppointment(request: BookAppointmentRequestDto): Promise<AxiosResponse<ApiResponse<string>>> {
        return repository.post<ApiResponse<string>>(`${RESOURCE}`, request);
    },

    /**
     * Update appointment details (Patient only)
     */
    updateAppointment(
        appointmentId: string,
        request: UpdateAppointmentRequestDto
    ): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.patch<ApiResponse<void>>(`${RESOURCE}/${appointmentId}`, request);
    },

    /**
     * Cancel appointment (Patient and Doctor)
     */
    cancelAppointment(
        appointmentId: string,
        request: CancelAppointmentRequestDto
    ): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.post<ApiResponse<void>>(`${RESOURCE}/cancel/${appointmentId}`, request.reason || "", {
            headers: { "Content-Type": "text/plain" },
        });
    },

    /**
     * Start virtual appointment (Doctor only)
     */
    startVirtualAppointment(appointmentId: string): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.put<ApiResponse<void>>(`${RESOURCE}/start-virtual/${appointmentId}`);
    },

    /**
     * Complete appointment (Doctor only)
     */
    completeAppointment(appointmentId: string, doctorNotes?: string): Promise<AxiosResponse<ApiResponse<void>>> {
        const params = doctorNotes ? `?doctorNotes=${encodeURIComponent(doctorNotes)}` : "";
        return repository.put<ApiResponse<void>>(`${RESOURCE}/complete/${appointmentId}${params}`);
    },
};

export default AppointmentApi;
