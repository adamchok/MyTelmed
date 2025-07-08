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
