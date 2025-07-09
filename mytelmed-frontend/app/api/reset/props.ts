// Request DTOs for Password Reset
export interface InitiatePasswordResetRequestDto {
    email: string; // Must be valid email format
    nric: string; // Must be 12 digits
}

export interface ResetPasswordRequestDto {
    password: string; // New password
}

// Request DTOs for Email Reset
export interface InitiateEmailResetRequestDto {
    nric: string; // Must be 12 digits
    phone: string; // Must be 10 digits
    serialNumber: string;
    name: string;
    email: string; // New email, must be valid email format
}

export interface ResetEmailRequestDto {
    email: string; // Must be valid email format
}
