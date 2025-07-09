import { AxiosResponse } from "axios";
import repository from "../RepositoryManager";
import { ApiResponse } from "../props";
import { SendVerificationEmailRequestDto } from "./props";

const RESOURCE: string = "/api/v1/verification";

const VerificationApi = {
    /**
     * Send verification email to specified email address (Open endpoint)
     * Sends a verification link to the user's email for account verification
     */
    sendVerificationEmail(request: SendVerificationEmailRequestDto): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.post<ApiResponse<void>>(`${RESOURCE}/send`, request);
    },

    /**
     * Verify email using the provided token (Open endpoint)
     * Completes email verification using the token from the verification email
     */
    verifyEmail(token: string): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.post<ApiResponse<void>>(`${RESOURCE}/verify/${token}`);
    },
};

export default VerificationApi;
