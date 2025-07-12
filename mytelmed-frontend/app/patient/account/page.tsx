"use client";

import { useState } from "react";
import { message, Form } from "antd";
import AccountApi from "@/app/api/account";
import { UpdateAccountPasswordRequest } from "@/app/api/account/props";
import { AccountComponentProps } from "./props";
import AccountComponent from "./component";

const Account = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Password strength states
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [passwordStrengthText, setPasswordStrengthText] = useState("");
    const [passwordStrengthColor, setPasswordStrengthColor] = useState("");
    const [newPassword, setNewPassword] = useState("");

    // Calculate password strength
    const calculatePasswordStrength = (password: string) => {
        setNewPassword(password);
        let score = 0;
        let text = "";
        let color = "";

        if (password.length >= 8) score += 20;
        if (/[a-z]/.test(password)) score += 20;
        if (/[A-Z]/.test(password)) score += 20;
        if (/\d/.test(password)) score += 20;
        if (/[@$!%*?&]/.test(password)) score += 20;

        if (score <= 20) {
            text = "Very Weak";
            color = "#ff4d4f";
        } else if (score <= 40) {
            text = "Weak";
            color = "#fa8c16";
        } else if (score <= 60) {
            text = "Fair";
            color = "#faad14";
        } else if (score <= 80) {
            text = "Good";
            color = "#52c41a";
        } else {
            text = "Strong";
            color = "#1890ff";
        }

        setPasswordStrength(score);
        setPasswordStrengthText(text);
        setPasswordStrengthColor(color);
    };

    // Reset password strength states
    const resetPasswordStates = () => {
        setPasswordStrength(0);
        setPasswordStrengthText("");
        setPasswordStrengthColor("");
        setNewPassword("");
    };

    // Handle password update
    const handleUpdatePassword = async (values: any) => {
        try {
            setLoading(true);
            setError(null);

            const updateData: UpdateAccountPasswordRequest = {
                newPassword: values.newPassword,
                currentPassword: values.currentPassword,
            };

            const response = await AccountApi.updatePassword(updateData);

            if (response.data?.isSuccess) {
                message.success("Password updated successfully");
                form.resetFields();
                resetPasswordStates(); // Reset password strength states
            } else {
                setError(response.data?.message || "Failed to update password");
            }
        } catch (err: any) {
            console.error("Failed to update password:", err);
            setError(err.response?.data?.message || "Failed to update password");
        } finally {
            setLoading(false);
        }
    };

    // Handle clear messages
    const handleClearError = () => {
        setError(null);
    };

    // Prepare props for component
    const componentProps: AccountComponentProps = {
        form,
        loading,
        error,
        onUpdatePassword: handleUpdatePassword,
        onClearError: handleClearError,
        passwordStrength,
        passwordStrengthText,
        passwordStrengthColor,
        newPassword,
        onCalculatePasswordStrength: calculatePasswordStrength,
    };

    return <AccountComponent {...componentProps} />;
};

export default Account;
