"use client";

import { Form, Input, Button, Typography } from "antd";
import { VerifyEmailPageComponentProps } from "./props";
import { Mail, Shield, RotateCcw } from "lucide-react";

const { Title, Text } = Typography;

const VerifyEmailPageComponent = ({
    form,
    onFinish,
    handleCancel,
    email,
    loading,
    resendCooldown,
    codeSent,
    handleSendCode,
}: VerifyEmailPageComponentProps) => {
    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-blue-700 py-10 sm:py-12 md:py-16 px-3 sm:px-8">
            {/* Email Verification Card */}
            <div className="relative z-10 w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl">
                <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-blue-900/20 p-3 sm:p-4 md:p-6 lg:p-8">
                    <div className="text-center mb-4 sm:mb-6">
                        <Title
                            level={3}
                            className="mb-2 text-blue-700 text-lg sm:text-xl md:text-2xl lg:text-3xl flex items-center justify-center"
                        >
                            <Mail className="text-blue-600 w-8 h-8 mr-3" strokeWidth={2} />
                            Verify Your Email
                        </Title>
                        <Text className="text-gray-500 text-xs sm:text-sm">
                            We&apos;ve sent a verification code to your email address. Please enter it below to continue
                            with your registration.
                        </Text>
                    </div>
                    <Form
                        form={form}
                        layout="vertical"
                        initialValues={{ email: email }}
                        onFinish={onFinish}
                        className="space-y-3 sm:space-y-4"
                    >
                        <Form.Item
                            label={
                                <span className="text-xs sm:text-sm font-medium text-gray-700 flex items-center">
                                    <Mail className="mr-2 text-blue-500 w-3 h-3 sm:w-4 sm:h-4" strokeWidth={2} />
                                    Email Address
                                </span>
                            }
                            name="email"
                            rules={[
                                { required: true, message: "Please enter your email" },
                                { type: "email", message: "Please enter a valid email" },
                            ]}
                        >
                            <Input
                                placeholder="Enter your email address"
                                className="h-10 sm:h-12 rounded-lg sm:rounded-xl border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors text-sm sm:text-base"
                            />
                        </Form.Item>

                        <Form.Item
                            label={
                                <span className="text-xs sm:text-sm font-medium text-gray-700 flex items-center">
                                    <Shield className="mr-2 text-blue-500 w-3 h-3 sm:w-4 sm:h-4" strokeWidth={2} />
                                    Verification Code
                                </span>
                            }
                            name="code"
                            rules={[
                                {
                                    required: true,
                                    message: "Please enter the verification code sent to your email",
                                },
                            ]}
                        >
                            <Input
                                placeholder="Enter 6-digit verification code"
                                className="h-10 sm:h-12 rounded-lg sm:rounded-xl border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors text-sm sm:text-base"
                                maxLength={6}
                            />
                        </Form.Item>

                        <div className="text-right">
                            <Button
                                type="link"
                                onClick={handleSendCode}
                                disabled={resendCooldown > 0}
                                loading={loading}
                                className="flex items-center space-x-2 text-blue-500 hover:text-blue-600 font-medium transition-colors text-xs sm:text-sm"
                                icon={<RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" strokeWidth={2} />}
                            >
                                {resendCooldown > 0 ? `Resend Code (${resendCooldown}s)` : "Send/Resend Code"}
                            </Button>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end">
                            <Button
                                type="default"
                                onClick={handleCancel}
                                className="h-10 sm:h-12 px-6 sm:px-8 rounded-lg sm:rounded-xl border-2 border-gray-200 hover:border-red-400 hover:text-red-500 font-medium transition-all duration-300 hover:shadow-lg text-sm sm:text-base"
                            >
                                Back to Details
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                disabled={!codeSent}
                                className={`h-10 sm:h-12 px-8 sm:px-12 rounded-lg sm:rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base ${
                                    codeSent
                                        ? "bg-blue-700 border-0 hover:bg-blue-900"
                                        : "bg-gray-300 border-0 cursor-not-allowed"
                                }`}
                            >
                                {codeSent ? "Verify & Continue" : "Send Code First"}
                            </Button>
                        </div>
                    </Form>
                </div>

                {/* Help Text */}
                <div className="text-center mt-4 sm:mt-6">
                    <p className="text-gray-200 text-xs sm:text-sm mb-2 sm:mb-3 px-2">
                        Didn&apos;t receive the code? Check your spam folder or click &quot;Send/Resend Code&quot; to
                        try again.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmailPageComponent;
