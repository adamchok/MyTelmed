"use client";

import React, { useState } from "react";
import { Card, Form, Input, Button, Typography, message, Space } from "antd";
import { UserOutlined, LockOutlined, SaveOutlined, EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import AccountApi from "@/app/api/account";

const { Title, Text } = Typography;

const AdminAccountDetailsPage = () => {
    const [usernameForm] = Form.useForm();
    const [passwordForm] = Form.useForm();
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [usernameLoading, setUsernameLoading] = useState(false);

    const handleUpdateUsername = async () => {
        setUsernameLoading(true);
        try {
            const values = await usernameForm.validateFields();
            const response = await AccountApi.updateUsername({
                newUsername: values.username,
                currentPassword: values.currentPassword,
            });
            if (response.data.isSuccess) {
                message.success("Username updated successfully");
                usernameForm.resetFields(["currentPassword"]);
            } else {
                message.error(response.data.message || "Failed to update username");
            }
        } catch {
            message.error("Failed to update username");
        } finally {
            setUsernameLoading(false);
        }
    };

    const handleUpdatePassword = async () => {
        setPasswordLoading(true);
        try {
            const values = await passwordForm.validateFields();
            if (values.newPassword !== values.confirmPassword) {
                message.error("Passwords do not match");
                setPasswordLoading(false);
                return;
            }
            const response = await AccountApi.updatePassword({
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
            });
            if (response.data.isSuccess) {
                message.success("Password updated successfully");
                passwordForm.resetFields();
            } else {
                message.error(response.data.message || "Failed to update password");
            }
        } catch {
            message.error("Failed to update password");
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <div>
            <div className="mb-6">
                <Title level={2} className="mb-2">
                    Account Settings
                </Title>
                <Text type="secondary">Update your username and password</Text>
            </div>

            <Card
                title={
                    <Space>
                        <UserOutlined /> <span>Update Username</span>
                    </Space>
                }
                className="mb-6"
            >
                <Form form={usernameForm} layout="vertical" onFinish={handleUpdateUsername} autoComplete="off">
                    <Form.Item
                        label="Username"
                        name="username"
                        rules={[
                            { required: true, message: "Please enter your username" },
                            { min: 3, max: 20, message: "Username must be between 3 and 20 characters" },
                        ]}
                    >
                        <Input
                            placeholder="Enter new username"
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="off"
                            spellCheck={false}
                        />
                    </Form.Item>
                    <Form.Item
                        label="Current Password"
                        name="currentPassword"
                        rules={[{ required: true, message: "Please enter your current password to confirm" }]}
                    >
                        <Input.Password
                            placeholder="Enter current password"
                            autoComplete="current-password"
                            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                        />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={usernameLoading} icon={<SaveOutlined />}>
                            Update Username
                        </Button>
                    </Form.Item>
                </Form>
            </Card>

            <Card
                title={
                    <Space>
                        <LockOutlined /> <span>Change Password</span>
                    </Space>
                }
            >
                <Form form={passwordForm} layout="vertical" onFinish={handleUpdatePassword} autoComplete="off">
                    <Form.Item
                        label="Current Password"
                        name="currentPassword"
                        rules={[{ required: true, message: "Please enter your current password" }]}
                    >
                        <Input.Password
                            placeholder="Enter current password"
                            autoComplete="current-password"
                            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                        />
                    </Form.Item>
                    <Form.Item
                        label="New Password"
                        name="newPassword"
                        rules={[
                            { required: true, message: "Please enter your new password" },
                            {
                                min: 8,
                                message: "Password must be at least 8 characters long",
                            },
                            {
                                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                                message: "Password must include uppercase, lowercase, digit, and special character",
                            },
                        ]}
                    >
                        <Input.Password
                            placeholder="Enter new password"
                            autoComplete="new-password"
                            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                        />
                    </Form.Item>
                    <Form.Item
                        label="Confirm New Password"
                        name="confirmPassword"
                        dependencies={["newPassword"]}
                        rules={[
                            { required: true, message: "Please confirm your new password" },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue("newPassword") === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error("Passwords do not match!"));
                                },
                            }),
                        ]}
                    >
                        <Input.Password
                            placeholder="Confirm new password"
                            autoComplete="new-password"
                            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                        />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={passwordLoading} icon={<SaveOutlined />}>
                            Update Password
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default AdminAccountDetailsPage;
