import repository from "../RepositoryManager";
import {
  LoginRequestOptions,
  JwtResponse,
  RefreshTokenRequestOptions,
  RegistrationRequestOptions,
  SendVerificationEmailRequestOptions,
  InitiatePasswordResetRequestOptions,
  ResetPasswordRequestOptions,
  InitiateEmailResetRequestOptions,
  ResetEmailRequestOptions,
} from "./props";
import { ApiResponse } from "../props";

const AUTH_BASE = "/api/v1/auth";
const VERIFICATION_BASE = "/api/v1/verification";
const RESET_BASE = "/api/v1/reset";
const PATIENT_BASE = "/api/v1/patient";

const AuthApi = {
  login(credentials: LoginRequestOptions): Promise<ApiResponse<JwtResponse>> {
    return repository.post(`${AUTH_BASE}/login`, credentials);
  },
  refreshToken(refreshToken: string): Promise<ApiResponse<JwtResponse>> {
    const request: RefreshTokenRequestOptions = { refreshToken };
    return repository.post(`${AUTH_BASE}/token/refresh`, request);
  },
  logout(): Promise<ApiResponse<void>> {
    return repository.post(`${AUTH_BASE}/logout`);
  },
  register(userData: RegistrationRequestOptions): Promise<ApiResponse<void>> {
    return repository.post(`${PATIENT_BASE}/register`, userData);
  },
  sendVerificationEmail(
    emailData: SendVerificationEmailRequestOptions
  ): Promise<ApiResponse<void>> {
    return repository.post(`${VERIFICATION_BASE}/send`, emailData);
  },
  verifyEmail(token: string): Promise<ApiResponse<void>> {
    return repository.post(`${VERIFICATION_BASE}/verify/${token}`);
  },
  initiatePasswordReset(
    resetData: InitiatePasswordResetRequestOptions
  ): Promise<ApiResponse<void>> {
    return repository.post(`${RESET_BASE}/password/initiate`, resetData);
  },
  resetPassword(
    token: string,
    passwordData: ResetPasswordRequestOptions
  ): Promise<ApiResponse<void>> {
    return repository.post(`${RESET_BASE}/password/${token}`, passwordData);
  },
  initiateEmailReset(
    resetData: InitiateEmailResetRequestOptions
  ): Promise<ApiResponse<void>> {
    return repository.post(`${RESET_BASE}/email/initiate`, resetData);
  },
  resetEmail(
    token: string,
    emailData: ResetEmailRequestOptions
  ): Promise<ApiResponse<void>> {
    return repository.post(`${RESET_BASE}/email/${token}`, emailData);
  },
};

export default AuthApi;
