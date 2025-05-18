export interface ForgotPasswordPageComponentProps {
  onFinish: (values: any) => void
}

export interface CreatePasswordFormProps {
  password: string,
  confirmPassword: string,
}

export interface PasswordResetResponse {
  isSuccess: boolean,
  message: string,
}
