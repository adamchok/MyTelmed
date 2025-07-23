import { FormInstance } from "antd";

export interface AccountComponentProps {
    // Form
    form: FormInstance;

    // State
    loading: boolean;
    error: string | null;

    // Password strength states
    passwordStrength: number;
    passwordStrengthText: string;
    passwordStrengthColor: string;
    newPassword: string;

    // Handlers
    onUpdatePassword: (values: any) => Promise<void>;
    onClearError: () => void;
    onCalculatePasswordStrength: (password: string) => void;
}

export default AccountComponentProps; 