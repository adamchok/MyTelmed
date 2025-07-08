import { FormInstance } from "antd/es/form";

export interface VerifyEmailPageComponentProps {
  form: FormInstance;
  email: string;
  loading: boolean;
  resendCooldown: number;
  onFinish: (values: any) => void;
  handleCancel: () => void;
  handleSendCode: () => void;
}

export interface EmailVerificationResponse {
  isSuccess: boolean;
  message: string;
}

export interface CodeVerificationResponse {
  isSuccess: boolean;
  message: string;
}
