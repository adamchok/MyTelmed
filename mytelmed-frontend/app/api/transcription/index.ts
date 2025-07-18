import { AxiosResponse } from "axios";
import repository from "../RepositoryManager";
import { ApiResponse } from "../props";
import { TranscriptionSummaryDto } from "./props";

const RESOURCE: string = "/api/v1/transcription";

const TranscriptionApi = {
    /**
     * Get transcription summary by appointment ID
     */
    getTranscriptionSummary(appointmentId: string): Promise<AxiosResponse<ApiResponse<TranscriptionSummaryDto | null>>> {
        return repository.get<ApiResponse<TranscriptionSummaryDto | null>>(`${RESOURCE}/appointment/${appointmentId}`);
    },

    /**
     * Check if transcription summary exists for appointment
     */
    hasTranscriptionSummary(appointmentId: string): Promise<AxiosResponse<ApiResponse<boolean>>> {
        return repository.get<ApiResponse<boolean>>(`${RESOURCE}/appointment/${appointmentId}/exists`);
    },

    /**
     * Delete transcription summary for appointment (Doctor/Admin only)
     */
    deleteTranscriptionSummary(appointmentId: string): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.delete<ApiResponse<void>>(`${RESOURCE}/appointment/${appointmentId}`);
    },
};

export default TranscriptionApi;
