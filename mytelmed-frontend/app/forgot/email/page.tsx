"use client";

import { useRouter } from "next/navigation";
import { message, Form } from "antd";
import { InitiateEmailResetRequestDto } from "@/app/api/reset/props";
import ForgotEmailPageComponent from "./component";
import ResetApi from "@/app/api/reset";
import { EmailResetFormValues } from "./props";
import { useState } from "react";

const ForgotEmail = () => {
    const router = useRouter();
    const [form] = Form.useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const onFinish = async (values: EmailResetFormValues) => {
        if (isSubmitting) return;

        setIsSubmitting(true);

        const emailResetRequest: InitiateEmailResetRequestDto = {
            nric: values.nric,
            name: values.name,
            phone: values.phone,
            serialNumber: values.serialNumber || "",
            email: values.email,
            userType: values.userType,
        };

        try {
            const response = await ResetApi.initiateEmailReset(emailResetRequest);
            const responseData = response.data;

            if (responseData.isSuccess) {
                message.success(responseData.message || "Email reset link sent successfully.");
                router.push("/");
            } else {
                message.error(responseData.message || "Failed to send email reset link.");
            }
        } catch (err: any) {
            message.error(err?.response?.data?.message ?? "Failed to send email reset link. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUserTypeChange = (value: string) => {
        // Clear serial number if not PATIENT
        if (value !== "PATIENT") {
            form.setFieldsValue({ serialNumber: undefined });
        }
    };

    return (
        <ForgotEmailPageComponent
            form={form}
            onFinish={onFinish}
            isSubmitting={isSubmitting}
            onUserTypeChange={handleUserTypeChange}
        />
    );
};

export default ForgotEmail;
