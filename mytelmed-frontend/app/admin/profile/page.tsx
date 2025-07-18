"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    Card,
    Form,
    Input,
    Button,
    Avatar,
    Typography,
    message,
    Row,
    Col,
    Divider,
    Space,
    Upload,
    Modal,
    Tooltip,
} from "antd";
import {
    UserOutlined,
    UploadOutlined,
    SaveOutlined,
    SettingOutlined,
    InfoCircleOutlined,
    PhoneOutlined,
    MailOutlined,
    IdcardOutlined,
} from "@ant-design/icons";
import AdminApi from "@/app/api/admin";
import { Admin, UpdateAdminProfileRequest } from "@/app/api/admin/props";

const { Title, Text } = Typography;

const AdminProfileDetailsPage = () => {
    const router = useRouter();
    const [profileForm] = Form.useForm();
    const [profile, setProfile] = useState<Admin | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [avatarModalVisible, setAvatarModalVisible] = useState(false);
    const [uploading, setUploading] = useState(false);

    const loadProfile = useCallback(async () => {
        setLoading(true);
        try {
            const response = await AdminApi.getProfile();
            if (response.data.isSuccess && response.data.data) {
                const profileData = response.data.data;
                setProfile(profileData);

                // Populate form with profile data
                profileForm.setFieldsValue({
                    name: profileData.name,
                    email: profileData.email,
                    phone: profileData.phone,
                });
            } else {
                console.log("Failed to load admin profile: ", response.data.message);
                message.error("Failed to load profile");
            }
        } catch {
            message.error("Failed to load profile");
        } finally {
            setLoading(false);
        }
    }, [profileForm]);

    const handleUpdateProfile = async () => {
        setUpdating(true);

        try {
            const values = await profileForm.validateFields();
            const updateData: UpdateAdminProfileRequest = {
                name: values.name,
                email: values.email,
                phone: values.phone,
            };
            const response = await AdminApi.updateProfile(updateData);
            if (response.data.isSuccess) {
                message.success("Profile updated successfully");
                loadProfile();
            }
        } catch {
            message.error("Failed to update profile");
        } finally {
            setUpdating(false);
        }
    };

    const handleAvatarUpload = async (file: File) => {
        if (uploading) return; // Prevent multiple uploads

        setUploading(true);
        try {
            const response = await AdminApi.updateProfileImage(file);
            if (response.data.isSuccess) {
                message.success("Profile picture updated successfully");
                setAvatarModalVisible(false); // Close modal on success
                loadProfile(); // Reload to show new image
            }
        } catch {
            message.error("Failed to update profile picture");
        } finally {
            setUploading(false);
        }
    };

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    return (
        <div>
            <div className="mb-6">
                <Title level={2} className="mb-2">
                    Profile Settings
                </Title>
                <Text type="secondary">Manage your account information and security settings</Text>
            </div>

            <Row gutter={[24, 24]}>
                {/* Profile Information */}
                <Col xs={24} lg={16}>
                    <Card
                        title={
                            <Space>
                                <UserOutlined />
                                <span>Profile Information</span>
                            </Space>
                        }
                        loading={loading}
                    >
                        <Form form={profileForm} layout="vertical" onFinish={handleUpdateProfile}>
                            <Row gutter={16}>
                                <Col xs={24} sm={12}>
                                    <Form.Item
                                        label={
                                            <span className="text-sm font-medium text-gray-700 flex items-center">
                                                Full Name
                                                <Tooltip title="Enter your complete name as it appears on official documents">
                                                    <InfoCircleOutlined className="text-blue-500 ml-2 cursor-pointer hover:text-blue-600 transition-colors" />
                                                </Tooltip>
                                            </span>
                                        }
                                        name="name"
                                        rules={[
                                            { required: true, message: "Please enter your full name" },
                                            { min: 2, message: "Name must be at least 2 characters long" },
                                            { max: 100, message: "Name cannot exceed 100 characters" },
                                            {
                                                pattern: /^[a-zA-Z\s]+$/,
                                                message: "Name can only contain letters and spaces",
                                            },
                                        ]}
                                    >
                                        <Input
                                            placeholder="Enter your full name"
                                            prefix={<IdcardOutlined className="text-gray-400" />}
                                            className="rounded-xl border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors"
                                            autoComplete="name"
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Form.Item
                                        label={
                                            <span className="text-sm font-medium text-gray-700 flex items-center">
                                                Email Address
                                                <Tooltip title="This email will be used for account notifications and password recovery">
                                                    <InfoCircleOutlined className="text-blue-500 ml-2 cursor-pointer hover:text-blue-600 transition-colors" />
                                                </Tooltip>
                                            </span>
                                        }
                                        name="email"
                                        rules={[
                                            { required: true, message: "Please enter your email address" },
                                            { type: "email", message: "Please enter a valid email address" },
                                            { max: 255, message: "Email address cannot exceed 255 characters" },
                                            {
                                                pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                                                message: "Please enter a valid email format (e.g., user@example.com)",
                                            },
                                        ]}
                                    >
                                        <Input
                                            placeholder="Enter your email address"
                                            prefix={<MailOutlined className="text-gray-400" />}
                                            className="rounded-xl border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors"
                                            autoComplete="email"
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col xs={24} sm={12}>
                                    <Form.Item
                                        label={
                                            <span className="text-sm font-medium text-gray-700 flex items-center">
                                                Phone Number (without hyphens)
                                                <Tooltip title="Example: 0112223333">
                                                    <InfoCircleOutlined className="text-blue-500 ml-2 cursor-pointer hover:text-blue-600 transition-colors" />
                                                </Tooltip>
                                            </span>
                                        }
                                        name="phone"
                                        rules={[
                                            { required: true, message: "Please enter your phone number" },
                                            {
                                                pattern: /^0[0-46-9]-?\d{7,8}$/,
                                                message: "Please enter a valid Malaysian phone number",
                                            },
                                        ]}
                                    >
                                        <Input
                                            placeholder="Enter your phone number"
                                            prefix={<PhoneOutlined className="text-gray-400" />}
                                            className="rounded-xl border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors"
                                            autoComplete="tel"
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item>
                                <Button type="primary" htmlType="submit" loading={updating} icon={<SaveOutlined />}>
                                    Update Profile
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                </Col>

                {/* Profile Picture & Account Details */}
                <Col xs={24} lg={8}>
                    <Card title="Profile Picture" loading={loading}>
                        <div className="text-center">
                            <Avatar
                                size={120}
                                icon={<UserOutlined />}
                                src={profile?.profileImageUrl}
                                className="mb-4"
                            />
                            <div>
                                <Button
                                    type="default"
                                    icon={<UploadOutlined />}
                                    onClick={() => setAvatarModalVisible(true)}
                                >
                                    Change Picture
                                </Button>
                            </div>
                        </div>
                    </Card>

                    <Card title="Account Details" className="mt-6" loading={loading}>
                        <div className="space-y-4">
                            <div>
                                <Text strong>Account ID</Text>
                                <br />
                                <Text type="secondary" className="font-mono text-xs">
                                    {profile?.id}
                                </Text>
                            </div>

                            <Divider className="my-3" />

                            <div>
                                <Text strong>Member Since</Text>
                                <br />
                                <Text type="secondary">
                                    {profile?.createdAt &&
                                        new Date(Number(profile.createdAt) * 1000).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                </Text>
                            </div>

                            <div>
                                <Text strong>Last Updated</Text>
                                <br />
                                <Text type="secondary">
                                    {profile?.updatedAt &&
                                        new Date(Number(profile.updatedAt) * 1000).toLocaleTimeString("en-US", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                </Text>
                            </div>
                        </div>
                    </Card>

                    <Card title="Account Security" className="mt-6">
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <div>
                                    <Text strong>Username & Password</Text>
                                    <br />
                                    <Text type="secondary" className="text-sm">
                                        Update your login credentials
                                    </Text>
                                </div>
                                <Button
                                    size="small"
                                    type="primary"
                                    icon={<SettingOutlined />}
                                    onClick={() => router.push("/admin/account")}
                                >
                                    Manage
                                </Button>
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Avatar Upload Modal */}
            <Modal
                title="Change Profile Picture"
                open={avatarModalVisible}
                onCancel={() => !uploading && setAvatarModalVisible(false)}
                footer={null}
                width={400}
                closable={!uploading}
                maskClosable={!uploading}
            >
                <div className="text-center space-y-4">
                    <Avatar size={100} icon={<UserOutlined />} src={profile?.profileImageUrl} className="mb-4" />
                    <br />
                    <Upload
                        beforeUpload={(file) => {
                            handleAvatarUpload(file);
                            return false; // Prevent default upload
                        }}
                        accept="image/jpeg, image/png"
                        showUploadList={false}
                        disabled={uploading}
                    >
                        <Button icon={<UploadOutlined />} block loading={uploading} disabled={uploading}>
                            {uploading ? "Uploading..." : "Select New Picture"}
                        </Button>
                    </Upload>

                    <div className="text-sm text-gray-500">
                        <p>Supported formats: JPG, PNG</p>
                        <p>Maximum file size: 5MB</p>
                        <p>Recommended size: 400x400 pixels</p>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

const AdminProfilePageWrapper = () => {
    return <AdminProfileDetailsPage />;
};

export default AdminProfilePageWrapper;
