import { ConsultationMode } from "../props";

// Main TimeSlot DTO
export interface TimeSlotDto {
    id: string;
    doctorId: string;
    startTime: string; // LocalDateTime as ISO string
    endTime: string; // LocalDateTime as ISO string
    durationMinutes: number;
    consultationMode: ConsultationMode;
    isAvailable: boolean;
    isBooked: boolean;
}

// Request DTOs
export interface CreateTimeSlotRequestDto {
    startTime: string; // LocalDateTime as ISO string - must be in future
    endTime: string; // LocalDateTime as ISO string - must be in future
    durationMinutes: number; // Min: 15, Max: 180 minutes
    consultationMode: ConsultationMode;
}

export interface UpdateTimeSlotRequestDto {
    startTime: string; // LocalDateTime as ISO string - must be in future
    endTime: string; // LocalDateTime as ISO string - must be in future
    durationMinutes: number; // Min: 15, Max: 180 minutes
    consultationMode: ConsultationMode;
}

// Search/filter options
export interface TimeSlotSearchOptions {
    fromDate?: string; // LocalDateTime as ISO string
    startDate?: string; // For available slots search
    endDate?: string; // For available slots search
}
