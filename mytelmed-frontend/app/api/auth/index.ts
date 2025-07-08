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
  ApiResponse,
  AuthError,
} from "./props";

/**
 * Authentication API Client
 * Matches the backend Spring Boot controllers exactly
 */
class AuthenticationAPI {
  private static readonly AUTH_BASE = "/api/v1/auth";
  private static readonly VERIFICATION_BASE = "/api/v1/verification";
  private static readonly RESET_BASE = "/api/v1/reset";
  private static readonly PATIENT_BASE = "/api/v1/patient";

  // ===== Authentication Endpoints =====

  /**
   * Login with username/password
   * POST /api/v1/auth/login
   */
  static async login(
    credentials: LoginRequestOptions
  ): Promise<ApiResponse<JwtResponse>> {
    try {
      const response = await repository.post(
        `${AuthenticationAPI.AUTH_BASE}/login`,
        credentials
      );
      return {
        success: true,
        message: response.data?.message || "Login successful",
        data: response.data?.data,
      };
    } catch (error: any) {
      console.error("Login failed:", error);
      throw AuthenticationAPI.handleAuthError(error, "Login failed");
    }
  }

  /**
   * Refresh access token using refresh token
   * POST /api/v1/auth/token/refresh
   */
  static async refreshToken(
    refreshToken: string
  ): Promise<ApiResponse<JwtResponse>> {
    try {
      const request: RefreshTokenRequestOptions = { refreshToken };
      const response = await repository.post(
        `${AuthenticationAPI.AUTH_BASE}/token/refresh`,
        request
      );

      return {
        success: true,
        message: response.data?.message || "Token refreshed successfully",
        data: response.data?.data,
      };
    } catch (error: any) {
      console.error("Token refresh failed:", error);
      throw AuthenticationAPI.handleAuthError(error, "Token refresh failed");
    }
  }

  /**
   * Logout user (requires authentication)
   * POST /api/v1/auth/logout
   */
  static async logout(): Promise<ApiResponse<void>> {
    try {
      const response = await repository.post(
        `${AuthenticationAPI.AUTH_BASE}/logout`
      );

      // Clear stored tokens
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("isLogin");
      }

      return {
        success: true,
        message: response.data?.message || "Logout successful",
      };
    } catch (error: any) {
      console.error("Logout failed:", error);

      // Still clear local storage even if backend call fails
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("isLogin");
      }

      throw AuthenticationAPI.handleAuthError(error, "Logout failed");
    }
  }

  // ===== Registration Endpoints =====

  /**
   * Register new patient
   * POST /api/v1/patient/register
   */
  static async register(
    userData: RegistrationRequestOptions
  ): Promise<ApiResponse<void>> {
    try {
      const response = await repository.post(
        `${AuthenticationAPI.PATIENT_BASE}/register`,
        userData
      );

      return {
        success: true,
        message: response.data?.message || "Registration successful",
      };
    } catch (error: any) {
      console.error("Registration failed:", error);
      throw AuthenticationAPI.handleAuthError(error, "Registration failed");
    }
  }

  // ===== Email Verification Endpoints =====

  /**
   * Send verification email
   * POST /api/v1/verification/send
   */
  static async sendVerificationEmail(
    emailData: SendVerificationEmailRequestOptions
  ): Promise<ApiResponse<void>> {
    try {
      const response = await repository.post(
        `${AuthenticationAPI.VERIFICATION_BASE}/send`,
        emailData
      );

      return {
        success: true,
        message:
          response.data?.message || "Verification email sent successfully",
      };
    } catch (error: any) {
      console.error("Send verification email failed:", error);
      throw AuthenticationAPI.handleAuthError(
        error,
        "Failed to send verification email"
      );
    }
  }

  /**
   * Verify email with token
   * POST /api/v1/verification/verify/{token}
   */
  static async verifyEmail(token: string): Promise<ApiResponse<void>> {
    try {
      const response = await repository.post(
        `${AuthenticationAPI.VERIFICATION_BASE}/verify/${token}`
      );

      return {
        success: true,
        message: response.data?.message || "Email verified successfully",
      };
    } catch (error: any) {
      console.error("Email verification failed:", error);
      throw AuthenticationAPI.handleAuthError(
        error,
        "Email verification failed"
      );
    }
  }

  // ===== Password Reset Endpoints =====

  /**
   * Initiate password reset process
   * POST /api/v1/reset/password/initiate
   */
  static async initiatePasswordReset(
    resetData: InitiatePasswordResetRequestOptions
  ): Promise<ApiResponse<void>> {
    try {
      const response = await repository.post(
        `${AuthenticationAPI.RESET_BASE}/password/initiate`,
        resetData
      );

      return {
        success: true,
        message:
          response.data?.message || "Password reset link sent successfully",
      };
    } catch (error: any) {
      console.error("Initiate password reset failed:", error);
      throw AuthenticationAPI.handleAuthError(
        error,
        "Failed to initiate password reset"
      );
    }
  }

  /**
   * Complete password reset with token
   * POST /api/v1/reset/password/{token}
   */
  static async resetPassword(
    token: string,
    passwordData: ResetPasswordRequestOptions
  ): Promise<ApiResponse<void>> {
    try {
      const response = await repository.post(
        `${AuthenticationAPI.RESET_BASE}/password/${token}`,
        passwordData
      );

      return {
        success: true,
        message: response.data?.message || "Password reset successfully",
      };
    } catch (error: any) {
      console.error("Password reset failed:", error);
      throw AuthenticationAPI.handleAuthError(error, "Password reset failed");
    }
  }

  // ===== Email Reset Endpoints =====

  /**
   * Initiate email reset process
   * POST /api/v1/reset/email/initiate
   */
  static async initiateEmailReset(
    resetData: InitiateEmailResetRequestOptions
  ): Promise<ApiResponse<void>> {
    try {
      const response = await repository.post(
        `${AuthenticationAPI.RESET_BASE}/email/initiate`,
        resetData
      );

      return {
        success: true,
        message: response.data?.message || "Email reset link sent successfully",
      };
    } catch (error: any) {
      console.error("Initiate email reset failed:", error);
      throw AuthenticationAPI.handleAuthError(
        error,
        "Failed to initiate email reset"
      );
    }
  }

  /**
   * Complete email reset with token
   * POST /api/v1/reset/email/{token}
   */
  static async resetEmail(
    token: string,
    emailData: ResetEmailRequestOptions
  ): Promise<ApiResponse<void>> {
    try {
      const response = await repository.post(
        `${AuthenticationAPI.RESET_BASE}/email/${token}`,
        emailData
      );

      return {
        success: true,
        message: response.data?.message || "Email reset successfully",
      };
    } catch (error: any) {
      console.error("Email reset failed:", error);
      throw AuthenticationAPI.handleAuthError(error, "Email reset failed");
    }
  }

  // ===== Utility Methods =====

  /**
   * Check if user is currently authenticated
   */
  static isAuthenticated(): boolean {
    if (typeof window === "undefined") return false;

    const token = localStorage.getItem("accessToken");
    const isLogin = localStorage.getItem("isLogin") === "true";

    return !!(token && isLogin);
  }

  /**
   * Get current access token
   */
  static getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("accessToken");
  }

  /**
   * Get current refresh token
   */
  static getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("refreshToken");
  }

  /**
   * Store authentication tokens
   */
  static storeTokens(accessToken: string, refreshToken: string): void {
    if (typeof window === "undefined") return;

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("isLogin", "true");
  }

  /**
   * Clear all authentication data
   */
  static clearAuthData(): void {
    if (typeof window === "undefined") return;

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("isLogin");
  }

  /**
   * Handle authentication errors consistently
   */
  private static handleAuthError(
    error: any,
    defaultMessage: string
  ): AuthError {
    const response = error.response;

    if (response?.data) {
      return {
        message: response.data.message || defaultMessage,
        code: response.status?.toString(),
        field: response.data.field,
      };
    }

    if (error.request) {
      return {
        message: "Network error - please check your connection",
        code: "NETWORK_ERROR",
      };
    }

    return {
      message: error.message || defaultMessage,
      code: "UNKNOWN_ERROR",
    };
  }

  /**
   * Validate request data before sending
   */
  static validateLoginRequest(data: LoginRequestOptions): string[] {
    const errors: string[] = [];

    if (!data.username?.trim()) {
      errors.push("Username is required");
    }

    if (!data.password?.trim()) {
      errors.push("Password is required");
    }

    return errors;
  }

  static validateRegistrationRequest(
    data: RegistrationRequestOptions
  ): string[] {
    const errors: string[] = [];

    if (!data.name?.trim() || data.name.length < 2 || data.name.length > 50) {
      errors.push("Name must be between 2 and 50 characters");
    }

    if (!RegExp(/^\d{12}$/).exec(data.nric)) {
      errors.push("NRIC must be exactly 12 digits");
    }

    if (!RegExp(/^[^\s@]+@[^\s@]+\.[^\s@]+$/).exec(data.email)) {
      errors.push("Please enter a valid email address");
    }

    if (!RegExp(/^[A-Za-z0-9]{10}$/).exec(data.serialNumber)) {
      errors.push("Serial number must be exactly 10 alphanumeric characters");
    }

    if (!RegExp(/^\d{9}$/).exec(data.phone)) {
      errors.push("Phone number must be exactly 9 digits");
    }

    if (!RegExp(/^\d{2}-\d{2}-\d{4}$/).exec(data.dateOfBirth)) {
      errors.push("Date of birth must be in the format MM-DD-YYYY");
    }

    if (
      !RegExp(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      ).exec(data.password)
    ) {
      errors.push(
        "Password must be at least 8 characters with uppercase, lowercase, digit, and special character"
      );
    }

    if (!Object.values(["MALE", "FEMALE"]).includes(data.gender)) {
      errors.push("Gender must be MALE or FEMALE");
    }

    return errors;
  }

  static validateEmailRequest(
    data: SendVerificationEmailRequestOptions
  ): string[] {
    const errors: string[] = [];

    if (!RegExp(/^[^\s@]+@[^\s@]+\.[^\s@]+$/).exec(data.email)) {
      errors.push("Please enter a valid email address");
    }

    return errors;
  }

  static validatePasswordResetRequest(
    data: InitiatePasswordResetRequestOptions
  ): string[] {
    const errors: string[] = [];

    if (!RegExp(/^[^\s@]+@[^\s@]+\.[^\s@]+$/).exec(data.email)) {
      errors.push("Please enter a valid email address");
    }

    if (!RegExp(/^\d{12}$/).exec(data.nric)) {
      errors.push("NRIC must be exactly 12 digits");
    }

    return errors;
  }
}

// ===== Legacy API Compatibility =====
// Maintaining backward compatibility while transitioning

const AuthApi = {
  // New methods (recommended)
  ...AuthenticationAPI,

  // Legacy methods for backward compatibility
  signIn: AuthenticationAPI.login,
  refreshSession: (refreshToken: string) =>
    AuthenticationAPI.refreshToken(refreshToken),
  verifyCode: (email: string, token: string) =>
    AuthenticationAPI.verifyEmail(token),
  requestVerificationCode: AuthenticationAPI.sendVerificationEmail,
  register: AuthenticationAPI.register,
  requestPasswordReset: AuthenticationAPI.initiatePasswordReset,
  resetPassword: (token: string, password: string) =>
    AuthenticationAPI.resetPassword(token, { password }),
  requestEmailReset: AuthenticationAPI.initiateEmailReset,
  resetEmail: (token: string, email: string) =>
    AuthenticationAPI.resetEmail(token, { email }),
};

export default AuthApi;
export { AuthenticationAPI };
