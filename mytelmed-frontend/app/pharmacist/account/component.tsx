"use client";

import { Form, Input, Button, Card, Typography, Alert, Row, Col, Progress } from "antd";
import { Lock, Shield, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AccountComponentProps } from "./props";

const { Title, Text } = Typography;

const AccountComponent = ({
    form,
    loading,
    error,
    onUpdatePassword,
    onClearError,
    passwordStrength,
    passwordStrengthText,
    passwordStrengthColor,
    newPassword,
    onCalculatePasswordStrength,
}: AccountComponentProps) => {
    // Password validation rules
    const passwordRules = [
        { required: true, message: "Password is required" },
        { min: 8, message: "Password must be at least 8 characters" },
        {
            pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
            message:
                "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
        },
    ];

    // Confirm password validation
    const confirmPasswordRules = [
        { required: true, message: "Please confirm your password" },
        ({ getFieldValue }: any) => ({
            validator(_: any, value: string) {
                if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                }
                return Promise.reject(new Error("Passwords do not match"));
            },
        }),
    ];

    return (
        <div className="container mx-auto">
            {/* Header */}
            <div className="mb-8 relative">
                <Link href="/pharmacist/profile" className="absolute left-0 top-0 z-10">
                    <Button
                        type="text"
                        icon={<ArrowLeft className="w-4 h-4" />}
                        className="text-gray-600 hover:text-gray-800"
                    >
                        Back to Profile
                    </Button>
                </Link>
                <div className="text-center">
                    <Title level={2} className="text-gray-800 mb-2 mt-0 text-xl md:text-3xl">
                        Account Settings
                    </Title>
                    <Text className="text-gray-600 text-sm md:text-base">
                        Manage your account security and preferences
                    </Text>
                </div>
            </div>

            {error && (
                <Alert
                    message="Error"
                    description={error}
                    type="error"
                    showIcon
                    className="mb-6"
                    closable
                    onClose={onClearError}
                />
            )}

            <Row gutter={[24, 24]} justify="center">
                <Col xs={24} md={16} lg={12}>
                    <Card className="shadow-lg border-0 bg-white" styles={{ body: { padding: "32px" } }}>
                        <div className="flex items-center mb-8">
                            <Shield className="w-8 h-8 text-purple-500 mr-4" />
                            <Title level={3} className="m-0 text-gray-800">
                                Change Password
                            </Title>
                        </div>

                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={onUpdatePassword}
                            requiredMark={false}
                            className="space-y-6"
                        >
                            {/* Current Password */}
                            <Form.Item
                                label={
                                    <span className="text-sm font-medium text-gray-700 flex items-center">
                                        <Lock className="mr-2 text-purple-500" size={18} strokeWidth={2.2} />
                                        Current Password
                                    </span>
                                }
                                name="currentPassword"
                                rules={[{ required: true, message: "Please enter your current password" }]}
                            >
                                <Input.Password
                                    placeholder="Enter your current password"
                                    className="h-12 rounded-xl border-gray-200 hover:border-purple-700 focus:border-purple-700 transition-colors"
                                    size="large"
                                />
                            </Form.Item>

                            {/* New Password */}
                            <Form.Item
                                label={
                                    <span className="text-sm font-medium text-gray-700 flex items-center">
                                        <Lock className="mr-2 text-purple-500" size={18} strokeWidth={2.2} />
                                        New Password
                                    </span>
                                }
                                name="newPassword"
                                rules={passwordRules}
                            >
                                <Input.Password
                                    placeholder="Enter your new password"
                                    className="h-12 rounded-xl border-gray-200 hover:border-purple-700 focus:border-purple-700 transition-colors"
                                    size="large"
                                    onChange={(e) => onCalculatePasswordStrength(e.target.value)}
                                />
                            </Form.Item>

                            {/* Password Strength Meter */}
                            {newPassword && (
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <Text className="text-sm text-gray-600">Password Strength:</Text>
                                        <Text className="text-sm font-medium" style={{ color: passwordStrengthColor }}>
                                            {passwordStrengthText}
                                        </Text>
                                    </div>
                                    <Progress
                                        percent={passwordStrength}
                                        strokeColor={passwordStrengthColor}
                                        showInfo={false}
                                        className="mb-2"
                                    />
                                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                                        <div
                                            className={`flex items-center ${newPassword.length >= 8 ? "text-green-600" : ""
                                                }`}
                                        >
                                            <span className="mr-1">✓</span> At least 8 characters
                                        </div>
                                        <div
                                            className={`flex items-center ${/[a-z]/.test(newPassword) ? "text-green-600" : ""
                                                }`}
                                        >
                                            <span className="mr-1">✓</span> Lowercase letter
                                        </div>
                                        <div
                                            className={`flex items-center ${/[A-Z]/.test(newPassword) ? "text-green-600" : ""
                                                }`}
                                        >
                                            <span className="mr-1">✓</span> Uppercase letter
                                        </div>
                                        <div
                                            className={`flex items-center ${/\d/.test(newPassword) ? "text-green-600" : ""
                                                }`}
                                        >
                                            <span className="mr-1">✓</span> Number
                                        </div>
                                        <div
                                            className={`flex items-center ${/[@$!%*?&]/.test(newPassword) ? "text-green-600" : ""
                                                }`}
                                        >
                                            <span className="mr-1">✓</span> Special character
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Confirm New Password */}
                            <Form.Item
                                label={
                                    <span className="text-sm font-medium text-gray-700 flex items-center">
                                        <Lock className="mr-2 text-purple-500" size={18} strokeWidth={2.2} />
                                        Confirm New Password
                                    </span>
                                }
                                name="confirmPassword"
                                rules={confirmPasswordRules}
                            >
                                <Input.Password
                                    placeholder="Confirm your new password"
                                    className="h-12 rounded-xl border-gray-200 hover:border-purple-700 focus:border-purple-700 transition-colors"
                                    size="large"
                                    onPaste={(e) => e.preventDefault()}
                                />
                            </Form.Item>

                            {/* Form Actions */}
                            <div className="flex justify-end space-x-4">
                                <Link href="/pharmacist/profile">
                                    <Button size="large">Cancel</Button>
                                </Link>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    size="large"
                                    loading={loading}
                                    icon={<Lock className="w-4 h-4" />}
                                    className="bg-purple-700 hover:bg-purple-800 border-purple-700"
                                >
                                    Update Password
                                </Button>
                            </div>
                        </Form>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AccountComponent;
