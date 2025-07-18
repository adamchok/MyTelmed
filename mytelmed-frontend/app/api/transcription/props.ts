/**
 * Props for transcription summary data
 */
export interface TranscriptionSummaryDto {
    appointmentId: string;
    patientSummary: string;
    doctorSummary: string;
    keyPoints: string[];
    actionItems: string[];
    processingStatus: string;
    aiModel: string;
    createdAt: string;
    updatedAt: string;
    errorMessage?: string;
}
