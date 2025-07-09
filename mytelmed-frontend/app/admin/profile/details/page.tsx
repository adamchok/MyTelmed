"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
    Modal
} from 'antd';
import {
    UserOutlined,
    UploadOutlined,
    SaveOutlined,
    SettingOutlined
} from '@ant-design/icons';
import AdminLayout from '../../layout';
import AdminApi from '@/app/api/admin';
import { Admin, UpdateAdminProfileRequest } from '@/app/api/admin/props';

const { Title, Text } = Typography;

const AdminProfileDetailsPage = () => {
    const router = useRouter();
    const [profileForm] = Form.useForm();
    const [profile, setProfile] = useState<Admin | null>(null);
    const [loading, setLoading] = useState(true);
    const [profileLoading, setProfileLoading] = useState(false);
    const [avatarModalVisible, setAvatarModalVisible] = useState(false);
    const [uploading, setUploading] = useState(false);

    const loadProfile = useCallback(async () => {
        setProfileLoading(true);
        try {
            const response = await AdminApi.getProfile();
            if (response.data.isSuccess && response.data.data) {
                setProfile(response.data.data);
            }
        } catch {
            message.error('Failed to load profile');
        } finally {
            setProfileLoading(false);
        }
    }, []);

    const handleUpdateProfile = useCallback(async () => {
        setLoading(true);

        try {
            const values = await profileForm.validateFields();
            const updateData: UpdateAdminProfileRequest = {
                name: values.name,
                email: values.email,
                phone: values.phone,
            };
            const response = await AdminApi.updateProfile(updateData);
            if (response.data.isSuccess) {
                message.success('Profile updated successfully');
                loadProfile();
            }
        } catch {
            message.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    }, [profileForm, loadProfile]);

    const handleAvatarUpload = async (file: File) => {
        if (uploading) return; // Prevent multiple uploads

        setUploading(true);
        try {
            const response = await AdminApi.updateProfileImage(file);
            if (response.data.isSuccess) {
                message.success('Profile picture updated successfully');
                setAvatarModalVisible(false); // Close modal on success
                loadProfile(); // Reload to show new image
            }
        } catch {
            message.error('Failed to update profile picture');
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
                <Title level={2} className="mb-2">Profile Settings</Title>
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
                        <Form
                            form={profileForm}
                            layout="vertical"
                            onFinish={handleUpdateProfile}
                        >
                            <Row gutter={16}>
                                <Col xs={24} sm={12}>
                                    <Form.Item
                                        label="Full Name"
                                        name="name"
                                        rules={[{ required: true, message: 'Please enter your full name' }]}
                                    >
                                        <Input placeholder="Enter your full name" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Form.Item
                                        label="Email Address"
                                        name="email"
                                        rules={[
                                            { required: true, message: 'Please enter your email' },
                                            { type: 'email', message: 'Please enter a valid email' }
                                        ]}
                                    >
                                        <Input placeholder="Enter your email address" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={profileLoading}
                                    icon={<SaveOutlined />}
                                >
                                    Update Profile
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                </Col>

                {/* Profile Picture & Account Details */}
                <Col xs={24} lg={8}>
                    <Card
                        title="Profile Picture"
                        loading={loading}
                    >
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

                    <Card
                        title="Account Details"
                        className="mt-6"
                        loading={loading}
                    >
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
                                    {profile?.createdAt && new Date(profile.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </Text>
                            </div>

                            <div>
                                <Text strong>Last Updated</Text>
                                <br />
                                <Text type="secondary">
                                    {profile?.updatedAt && new Date(profile.updatedAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </Text>
                            </div>
                        </div>
                    </Card>

                    <Card
                        title="Account Security"
                        className="mt-6"
                    >
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
                                    onClick={() => router.push('/admin/profile/account')}
                                >
                                    Manage
                                </Button>
                            </div>

                            <Divider className="my-3" />

                            <div className="flex justify-between items-center">
                                <div>
                                    <Text strong>Two-Factor Authentication</Text>
                                    <br />
                                    <Text type="secondary" className="text-sm">
                                        Add an extra layer of security
                                    </Text>
                                </div>
                                <Button size="small" type="link">
                                    Enable
                                </Button>
                            </div>

                            <Divider className="my-3" />

                            <div className="flex justify-between items-center">
                                <div>
                                    <Text strong>Login Sessions</Text>
                                    <br />
                                    <Text type="secondary" className="text-sm">
                                        Manage active sessions
                                    </Text>
                                </div>
                                <Button size="small" type="link">
                                    View
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
                    <Avatar
                        size={100}
                        icon={<UserOutlined />}
                        src={profile?.profileImageUrl}
                    />

                    <Upload
                        beforeUpload={(file) => {
                            handleAvatarUpload(file);
                            return false; // Prevent default upload
                        }}
                        accept="image/jpeg, image/png"
                        showUploadList={false}
                        disabled={uploading}
                    >
                        <Button
                            icon={<UploadOutlined />}
                            block
                            loading={uploading}
                            disabled={uploading}
                        >
                            {uploading ? 'Uploading...' : 'Select New Picture'}
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
    return (
        <AdminLayout>
            <AdminProfileDetailsPage />
        </AdminLayout>
    );
};

export default AdminProfilePageWrapper;
