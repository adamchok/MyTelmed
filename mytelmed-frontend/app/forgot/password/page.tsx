"use client";

import { message, Form } from "antd";
import { useRouter } from "next/navigation";
import { InitiatePasswordResetRequestDto } from "@/app/api/reset/props";
import ForgotPasswordPageComponent from "./component";
import ResetApi from "@/app/api/reset";
import { PasswordResetFormValues } from "./props";
import { useState } from "react";

const ForgotPassword = () => {
    const router = useRouter();
    const [form] = Form.useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const onFinish = async (values: PasswordResetFormValues) => {
        if (isSubmitting) return;

        setIsSubmitting(true);

        const passwordResetRequest: InitiatePasswordResetRequestDto = {
            nric: values.nric,
            email: values.email,
            userType: values.userType,
        };

        try {
            const response = await ResetApi.initiatePasswordReset(passwordResetRequest);
            const responseData = response.data;

            if (responseData.isSuccess) {
                message.success(responseData.message || "Password reset link sent successfully.");
                router.push("/");
            } else {
                message.error(responseData.message || "Failed to send password reset link.");
            }
        } catch (err: any) {
            message.error(err?.response?.data?.message ?? "Failed to send password reset link. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUserTypeChange = (value: string) => {
        // This function can be used for any user type specific logic if needed
        console.log("User type changed to:", value);
    };

    return (
        <ForgotPasswordPageComponent
            form={form}
            onFinish={onFinish}
            isSubmitting={isSubmitting}
            onUserTypeChange={handleUserTypeChange}
        />
    );
};

export default ForgotPassword;
