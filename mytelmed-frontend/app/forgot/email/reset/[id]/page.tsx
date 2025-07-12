"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Form, Input, Button, Typography, message } from "antd";
import { CreateEmailFormProps } from "../../props";
import { ResetEmailRequestDto } from "@/app/api/reset/props";
import ResetApi from "@/app/api/reset";
import { Mail, ArrowLeft } from "lucide-react";

const { Title, Text } = Typography;

export default function CreateEmailPage() {
    const [form] = Form.useForm();
    const router = useRouter();
    const params = useParams();
    const { id } = params;
    const [loading, setLoading] = useState(false);

    const onFinish = async (values: CreateEmailFormProps) => {
        if (!id) {
            message.error("Invalid email reset link.");
            return;
        }

        await form.validateFields();

        const resetEmailRequest: ResetEmailRequestDto = {
            email: values.email,
        };

        try {
            setLoading(true);
            const response = await ResetApi.resetEmail(id as string, resetEmailRequest);

            const responseData = response.data;

            if (responseData.isSuccess) {
                message.success(responseData.message || "Email reset successfully.");
                router.push("/");
            } else {
                message.error(responseData.message || "Failed to reset email.");
            }
        } catch (err: any) {
            console.log("err", err);
            message.error(err?.response?.data?.message ?? "Failed to reset email. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Handle back button click
    const handleBackClick = (e: React.MouseEvent) => {
        e.preventDefault();
        router.push("/forgot/email");
    };

    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-blue-700 py-10 sm:py-12 md:py-16 px-3 sm:px-8">
            {/* Email Reset Card */}
            <div className="relative z-10 w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl">
                <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-blue-900/20 p-3 sm:p-4 md:p-6 lg:p-8">
                    <div className="text-center mb-4 sm:mb-6">
                        <Title
                            level={3}
                            className="mb-2 text-blue-700 text-lg sm:text-xl md:text-2xl lg:text-3xl flex items-center justify-center"
                        >
                            <Mail className="text-blue-600 w-8 h-8 mr-3" strokeWidth={2} />
                            Create New Email
                        </Title>
                        <Text className="text-gray-500 text-xs sm:text-sm">Please enter your new email below.</Text>
                    </div>
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={onFinish}
                        className="space-y-3 sm:space-y-4"
                        autoComplete="off"
                        validateTrigger="onBlur"
                    >
                        <Form.Item
                            label={
                                <span className="text-xs sm:text-sm font-medium text-gray-700 flex items-center">
                                    <Mail className="mr-2 text-blue-500 w-3 h-3 sm:w-4 sm:h-4" strokeWidth={2} />
                                    New Email
                                </span>
                            }
                            name="email"
                            rules={[
                                { required: true, message: "Please input your new email!" },
                                { type: "email", message: "Please enter a valid email address!" },
                            ]}
                            hasFeedback
                        >
                            <Input
                                placeholder="Enter new email"
                                className="h-10 sm:h-12 rounded-lg sm:rounded-xl border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors text-sm sm:text-base"
                            />
                        </Form.Item>

                        <Form.Item
                            label={
                                <span className="text-xs sm:text-sm font-medium text-gray-700 flex items-center">
                                    <Mail className="mr-2 text-blue-500 w-3 h-3 sm:w-4 sm:h-4" strokeWidth={2} />
                                    Confirm Email
                                </span>
                            }
                            name="confirmEmail"
                            dependencies={["email"]}
                            hasFeedback
                            rules={[
                                { required: true, message: "Please confirm your email!" },
                                { type: "email", message: "Please enter a valid email address!" },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue("email") === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error("Emails do not match!"));
                                    },
                                }),
                            ]}
                        >
                            <Input
                                placeholder="Confirm new email"
                                className="h-10 sm:h-12 rounded-lg sm:rounded-xl border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors text-sm sm:text-base"
                            />
                        </Form.Item>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end pt-4">
                            <Button
                                type="default"
                                onClick={handleBackClick}
                                className="h-10 sm:h-12 px-6 sm:px-8 rounded-lg sm:rounded-xl border-2 border-gray-200 hover:border-red-400 hover:text-red-500 font-medium transition-all duration-300 hover:shadow-lg text-sm sm:text-base"
                            >
                                <ArrowLeft className="w-4 h-4" strokeWidth={2} /> Back
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                disabled={loading}
                                className="h-10 sm:h-12 px-8 sm:px-12 rounded-lg sm:rounded-xl bg-blue-700 border-0 hover:bg-blue-900 font-medium shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
                            >
                                {loading ? "Resetting..." : "Reset Email"}
                            </Button>
                        </div>
                    </Form>
                </div>

                {/* Help Text */}
                <div className="text-center mt-4 sm:mt-6">
                    <p className="text-gray-200 text-xs sm:text-sm mb-2 sm:mb-3 px-2">
                        Your information is encrypted and secure. We comply with Malaysian healthcare data protection
                        standards.
                    </p>
                </div>
            </div>
        </div>
    );
}
