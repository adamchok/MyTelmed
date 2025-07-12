import { FormInstance } from "antd";

export interface ForgotEmailPageComponentProps {
    form: FormInstance;
    onFinish: (values: EmailResetFormValues) => void;
    isSubmitting: boolean;
    onUserTypeChange: (value: string) => void;
}

export interface EmailResetFormValues {
    nric: string;
    name: string;
    phone: string;
    serialNumber?: string;
    email: string;
    userType: "PATIENT" | "DOCTOR" | "PHARMACIST" | "ADMIN";
}

export interface EmailResetResponse {
    isSuccess: boolean;
    message: string;
}

export interface CreateEmailFormProps {
    email: string;
    confirmEmail: string;
}
