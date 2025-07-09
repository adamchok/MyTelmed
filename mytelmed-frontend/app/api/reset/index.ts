import { AxiosResponse } from "axios";
import repository from "../RepositoryManager";
import { ApiResponse } from "../props";
import {
    InitiatePasswordResetRequestDto,
    ResetPasswordRequestDto,
    InitiateEmailResetRequestDto,
    ResetEmailRequestDto,
} from "./props";

const RESOURCE: string = "/api/v1/reset";

const ResetApi = {
    /**
     * Initiate password reset process (Open endpoint)
     * Sends a password reset link to the user's email
     */
    initiatePasswordReset(request: InitiatePasswordResetRequestDto): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.post<ApiResponse<void>>(`${RESOURCE}/password/initiate`, request);
    },

    /**
     * Complete password reset with token (Open endpoint)
     * Resets the user's password using the token from email
     */
    resetPassword(token: string, request: ResetPasswordRequestDto): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.post<ApiResponse<void>>(`${RESOURCE}/password/${token}`, request);
    },

    /**
     * Initiate email reset process (Open endpoint)
     * Sends an email reset link to verify identity and change email
     */
    initiateEmailReset(request: InitiateEmailResetRequestDto): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.post<ApiResponse<void>>(`${RESOURCE}/email/initiate`, request);
    },

    /**
     * Complete email reset with token (Open endpoint)
     * Resets the user's email using the token from verification email
     */
    resetEmail(token: string, request: ResetEmailRequestDto): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.post<ApiResponse<void>>(`${RESOURCE}/email/${token}`, request);
    },
};

export default ResetApi;
