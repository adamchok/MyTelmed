export interface CreatePasswordPageProps {
  form: any;
  loading: boolean;
  onFinish: (values: any) => void;
  handleCancel: () => void;
}

export interface RegistrationResponse {
  isSuccess: boolean;
  message: string;
}
