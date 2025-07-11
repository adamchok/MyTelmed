"use client";

import { Button, Form, Input, Typography, Progress } from "antd";
import { CreatePasswordPageProps } from "./props";
import { Lock } from "lucide-react";
import { useState } from "react";

const { Title, Text } = Typography;

const CreatePasswordPageComponent = ({ form, onFinish, loading, handleCancel }: CreatePasswordPageProps) => {
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

    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-blue-700 py-10 sm:py-12 md:py-16 px-3 sm:px-8">
            {/* Password Creation Card */}
            <div className="relative z-10 w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl">
                <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-blue-900/20 p-3 sm:p-4 md:p-6 lg:p-8">
                    <div className="text-center mb-4 sm:mb-6">
                        <Title
                            level={3}
                            className="mb-2 text-blue-700 text-lg sm:text-xl md:text-2xl lg:text-3xl flex items-center justify-center"
                        >
                            <Lock className="text-blue-600 w-8 h-8 mr-3" strokeWidth={2} />
                            Create Your Password
                        </Title>
                        <Text className="text-gray-500 text-xs sm:text-sm">
                            Set a strong password to secure your MyTelmed account and protect your healthcare
                            information.
                        </Text>
                    </div>
                    <Form form={form} layout="vertical" onFinish={onFinish} className="space-y-3 sm:space-y-4">
                        <Form.Item
                            label={
                                <span className="text-xs sm:text-sm font-medium text-gray-700 flex items-center">
                                    <Lock className="mr-2 text-blue-500 w-3 h-3 sm:w-4 sm:h-4" strokeWidth={2} />
                                    Password
                                </span>
                            }
                            name="password"
                            rules={[
                                { required: true, message: "Please enter your password" },
                                { min: 8, message: "Password must be at least 8 characters" },
                                {
                                    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                                    message:
                                        "Password must be at least 8 characters and contain uppercase, lowercase, digit, and special character",
                                },
                            ]}
                            hasFeedback
                        >
                            <Input.Password
                                placeholder="Create your password"
                                className="h-10 sm:h-12 rounded-lg sm:rounded-xl border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors text-sm sm:text-base"
                                onChange={(e) => calculatePasswordStrength(e.target.value)}
                            />
                        </Form.Item>

                        {/* Password Strength Meter */}
                        {newPassword && (
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <Text className="text-xs sm:text-sm text-gray-600">Password Strength:</Text>
                                    <Text
                                        className="text-xs sm:text-sm font-medium"
                                        style={{ color: passwordStrengthColor }}
                                    >
                                        {passwordStrengthText}
                                    </Text>
                                </div>
                                <Progress
                                    percent={passwordStrength}
                                    strokeColor={passwordStrengthColor}
                                    showInfo={false}
                                    className="mb-2"
                                />
                                <div className="grid grid-cols-2 gap-1 sm:gap-2 text-xs text-gray-500">
                                    <div
                                        className={`flex items-center ${
                                            newPassword.length >= 8 ? "text-green-600" : ""
                                        }`}
                                    >
                                        <span className="mr-1">✓</span> At least 8 characters
                                    </div>
                                    <div
                                        className={`flex items-center ${
                                            /[a-z]/.test(newPassword) ? "text-green-600" : ""
                                        }`}
                                    >
                                        <span className="mr-1">✓</span> Lowercase letter
                                    </div>
                                    <div
                                        className={`flex items-center ${
                                            /[A-Z]/.test(newPassword) ? "text-green-600" : ""
                                        }`}
                                    >
                                        <span className="mr-1">✓</span> Uppercase letter
                                    </div>
                                    <div
                                        className={`flex items-center ${
                                            /\d/.test(newPassword) ? "text-green-600" : ""
                                        }`}
                                    >
                                        <span className="mr-1">✓</span> Number
                                    </div>
                                    <div
                                        className={`flex items-center ${
                                            /[@$!%*?&]/.test(newPassword) ? "text-green-600" : ""
                                        }`}
                                    >
                                        <span className="mr-1">✓</span> Special character
                                    </div>
                                </div>
                            </div>
                        )}

                        <Form.Item
                            label={
                                <span className="text-xs sm:text-sm font-medium text-gray-700 flex items-center">
                                    <Lock className="mr-2 text-blue-500 w-3 h-3 sm:w-4 sm:h-4" strokeWidth={2} />
                                    Confirm Password
                                </span>
                            }
                            name="confirmPassword"
                            dependencies={["password"]}
                            hasFeedback
                            rules={[
                                { required: true, message: "Please confirm your password" },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue("password") === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error("Passwords do not match!"));
                                    },
                                }),
                            ]}
                        >
                            <Input.Password
                                placeholder="Confirm your password"
                                className="h-10 sm:h-12 rounded-lg sm:rounded-xl border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors text-sm sm:text-base"
                            />
                        </Form.Item>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end pt-4">
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
                                className="h-10 sm:h-12 px-8 sm:px-12 rounded-lg sm:rounded-xl bg-blue-700 border-0 hover:bg-blue-900 font-medium shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
                            >
                                Complete Registration
                            </Button>
                        </div>
                    </Form>
                </div>

                {/* Help Text */}
                <div className="text-center mt-4 sm:mt-6">
                    <p className="text-gray-200 text-xs sm:text-sm mb-2 sm:mb-3 px-2">
                        Your password is encrypted and secure. We use industry-standard security measures to protect
                        your account.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CreatePasswordPageComponent;
