import { AxiosResponse } from "axios";
import repository from "../RepositoryManager";
import { ApiResponse } from "../props";
import { VideoCallDto } from "./props";
import { StreamTokenAndUserResponseDto } from "../chat/props";

const RESOURCE: string = "/api/v1/video-call";

const VideoCallApi = {
    /**
     * Get video call information by appointment ID (Doctor and Patient)
     * Retrieves video call details for a specific appointment
     */
    getVideoCallByAppointmentId(appointmentId: string): Promise<AxiosResponse<ApiResponse<VideoCallDto>>> {
        return repository.get<ApiResponse<VideoCallDto>>(`${RESOURCE}/appointment/${appointmentId}`);
    },

    /**
     * Get or create Stream call and get video call data (Doctor and Patient)
     * Returns existing video call data or creates if not available (fallback)
     */
    createStreamCallAndGetVideoCall(appointmentId: string): Promise<AxiosResponse<ApiResponse<VideoCallDto>>> {
        return repository.post<ApiResponse<VideoCallDto>>(`${RESOURCE}/stream/call`, appointmentId);
    },

    /**
     * Create video call and get Stream user token (Doctor and Patient)
     * Joins a video call and returns authentication token for Stream integration
     */
    createVideoCallAndGetStreamUserAndToken(
        appointmentId: string
    ): Promise<AxiosResponse<ApiResponse<StreamTokenAndUserResponseDto>>> {
        return repository.post<ApiResponse<StreamTokenAndUserResponseDto>>(`${RESOURCE}`, appointmentId);
    },

    /**
     * End video call for appointment (Doctor and Patient)
     * Terminates the video call session for the specified appointment
     */
    endVideoCall(appointmentId: string): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.post<ApiResponse<void>>(`${RESOURCE}/end/${appointmentId}`);
    },
};

export default VideoCallApi;
