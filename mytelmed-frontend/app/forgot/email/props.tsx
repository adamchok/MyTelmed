export interface ForgotEmailPageComponentProps {
  onFinish: (values: any) => void
}

export interface EmailResetResponse {
  isSuccess: boolean;
  message: string;
}

export interface CreateEmailFormProps {
  email: string;
  confirmEmail: string;
}
