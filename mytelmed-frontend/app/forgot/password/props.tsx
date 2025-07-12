import { FormInstance } from "antd";

export interface ForgotPasswordPageComponentProps {
    form: FormInstance;
    onFinish: (values: PasswordResetFormValues) => void;
    isSubmitting: boolean;
    onUserTypeChange: (value: string) => void;
}

export interface PasswordResetFormValues {
    nric: string;
    email: string;
    userType: "PATIENT" | "DOCTOR" | "PHARMACIST" | "ADMIN";
}

export interface CreatePasswordFormProps {
    password: string;
    confirmPassword: string;
}
