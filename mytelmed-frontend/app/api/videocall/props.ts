import { StreamTokenAndUserResponseDto } from "../props";

// Main VideoCall DTO
export interface VideoCallDto {
    id: string;
    appointmentId: string;
    streamCallId: string;
    streamCallType: string;
    patientToken?: string;
    providerToken?: string;
    meetingStartedAt?: string;
    meetingEndedAt?: string;
    patientJoinedAt?: string;
    providerJoinedAt?: string;
    patientLeftAt?: string;
    providerLeftAt?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

// Re-export for convenience
export type { StreamTokenAndUserResponseDto };
