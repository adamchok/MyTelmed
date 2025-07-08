// ===== Authentication Request/Response Types =====

export interface LoginRequestOptions {
  username: string;
  password: string;
}

export interface JwtResponse {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenRequestOptions {
  refreshToken: string; // UUID as string
}

// ===== Registration Types =====

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
}

export interface RegistrationRequestOptions {
  name: string;
  nric: string; // 12 digits
  email: string;
  serialNumber: string; // 10 alphanumeric characters
  phone: string; // 9 digits
  dateOfBirth: string; // MM-DD-YYYY format
  gender: Gender;
  password: string;
}

// ===== Verification Types =====

export interface SendVerificationEmailRequestOptions {
  email: string;
}

// ===== Password Reset Types =====

export interface InitiatePasswordResetRequestOptions {
  email: string;
  nric: string; // 12 digits
}

export interface ResetPasswordRequestOptions {
  password: string;
}

// ===== Email Reset Types =====

export interface InitiateEmailResetRequestOptions {
  nric: string; // 12 digits
  phone: string; // 9 digits
  serialNumber: string;
  name: string;
  email: string;
}

export interface ResetEmailRequestOptions {
  email: string;
}

// ===== Common Response Types =====

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp?: number;
}

// ===== Error Types =====

export interface AuthError {
  message: string;
  field?: string;
  code?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

// ===== Auth State Types =====

export interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  token: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
}

// ===== Form Validation Helpers =====

export const VALIDATION_PATTERNS = {
  nric: /^\d{12}$/,
  phone: /^\d{9}$/,
  serialNumber: /^[A-Za-z0-9]{10}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  dateOfBirth: /^\d{2}-\d{2}-\d{4}$/,
  password:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$/,
} as const;

export const VALIDATION_MESSAGES = {
  nric: "NRIC must be exactly 12 digits",
  phone: "Phone number must be exactly 9 digits",
  serialNumber: "Serial number must be exactly 10 alphanumeric characters",
  email: "Please enter a valid email address",
  dateOfBirth: "Date of birth must be in the format MM-DD-YYYY",
  password:
    "Password must be at least 8 characters long and include uppercase, lowercase, digit, and special character",
  name: "Name must be between 2 and 50 characters",
  required: "This field is required",
} as const;

// ===== Utility Types =====

export type AuthEndpoint =
  | "login"
  | "refresh"
  | "logout"
  | "register"
  | "verify-send"
  | "verify-token"
  | "password-reset-initiate"
  | "password-reset-complete"
  | "email-reset-initiate"
  | "email-reset-complete";
