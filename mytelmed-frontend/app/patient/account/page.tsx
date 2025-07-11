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
    };

    return <AccountComponent {...componentProps} />;
};

export default Account;
