import { FormInstance } from "antd";

export interface AccountComponentProps {
    // Form
    form: FormInstance;

    // State
    loading: boolean;
    error: string | null;

    // Handlers
    onUpdatePassword: (values: any) => Promise<void>;
    onClearError: () => void;
}

export default AccountComponentProps;
