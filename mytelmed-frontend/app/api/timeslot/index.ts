import { AxiosResponse } from "axios";
import repository from "../RepositoryManager";
import { ApiResponse } from "../props";
import { TimeSlotDto, CreateTimeSlotRequestDto, UpdateTimeSlotRequestDto, TimeSlotSearchOptions } from "./props";

const RESOURCE: string = "/api/v1/time-slots";

const TimeSlotApi = {
    /**
     * Get available time slots for a specific doctor within date range (All users)
     */
    getAvailableTimeSlots(
        doctorId: string,
        startDate: string,
        endDate: string
    ): Promise<AxiosResponse<ApiResponse<TimeSlotDto[]>>> {
        const params = `?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;
        return repository.get<ApiResponse<TimeSlotDto[]>>(`${RESOURCE}/${doctorId}/available${params}`);
    },

    /**
     * Get time slots for current doctor account (Doctor only)
     */
    getDoctorTimeSlots(options?: TimeSlotSearchOptions): Promise<AxiosResponse<ApiResponse<TimeSlotDto[]>>> {
        const params = options?.fromDate ? `?fromDate=${encodeURIComponent(options.fromDate)}` : "";
        return repository.get<ApiResponse<TimeSlotDto[]>>(`${RESOURCE}${params}`);
    },

    /**
     * Create new time slot (Doctor only)
     */
    createTimeSlot(request: CreateTimeSlotRequestDto): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.post<ApiResponse<void>>(`${RESOURCE}`, request);
    },

    /**
     * Update existing time slot (Doctor only)
     */
    updateTimeSlot(timeSlotId: string, request: UpdateTimeSlotRequestDto): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.patch<ApiResponse<void>>(`${RESOURCE}/${timeSlotId}`, request);
    },

    /**
     * Enable time slot (Doctor only)
     */
    enableTimeSlot(timeSlotId: string): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.patch<ApiResponse<void>>(`${RESOURCE}/enable/${timeSlotId}`);
    },

    /**
     * Disable time slot (Doctor only)
     */
    disableTimeSlot(timeSlotId: string): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.patch<ApiResponse<void>>(`${RESOURCE}/disable/${timeSlotId}`);
    },
};

export default TimeSlotApi;
