export interface LoginRequestOptions {
  username: string;
  password: string;
}

export interface CodeVerificationRequestOptions {
  email: string;
  token: string;
}

export interface EmailVerificationLinkRequestOptions {
  email: string;
}

export interface RegistrationRequestOptions {
  name: string;
  nric: string;
  serialNumber: string;
  email: string;
  phone: string;
  gender: string;
  dob: string;
  password: string;
}

export interface PasswordResetLinkRequestOptions {
  email: string;
  nric: string;
}

export interface ResetPasswordRequestOptions {
  id: string;
  password: string;
}

export interface EmailResetLinkRequestOptions {
  nric: string;
  name: string;
  phone: string;
  serialNumber: string;
  email: string;
}

export interface ResetEmailRequestOptions {
  id: string;
  email: string;
}
