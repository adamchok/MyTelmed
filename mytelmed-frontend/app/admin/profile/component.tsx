"use client";

import { useEffect } from "react";
import {
    Typography,
    Row,
    Col,
    Card,
    Button,
    Form,
    Input,
    Avatar,
    Upload,
    Alert,
    Divider,
    Spin,
    Badge,
    Tooltip,
} from "antd";
import { User, Mail, Phone, Edit, Save, Camera, Info } from "lucide-react";
import dayjs from "dayjs";
import { ProfileComponentProps } from "./props";

const { Title, Text } = Typography;

const ProfilePageComponent = ({
    admin,
    isEditing,
    loading,
    saving,
    uploadingImage,
    error,
    onToggleEditMode,
    onCancelEdit,
    onUpdateProfile,
    onImageUpload,
    onClearError,
    onRetry,
}: ProfileComponentProps) => {
    const [form] = Form.useForm();

    // Set form values when admin data changes
    useEffect(() => {
        if (admin) {
            form.setFieldsValue({
                name: admin.name,
                email: admin.email,
                phone: admin.phone,
            });
        }
    }, [admin, form]);

    // Format epoch timestamp for display
    const formatEpochDate = (epochTimestamp: string): string => {
        return dayjs(parseInt(epochTimestamp) * 1000).format("MMMM DD, YYYY");
    };

    // Get account status
    const getAccountStatus = (enabled: boolean) => {
        return {
            text: enabled ? "Active" : "Inactive",
            status: enabled ? ("success" as const) : ("error" as const),
        };
    };

    if (loading) {
        return (
            <div className="container mx-auto">
                <div className="flex justify-center items-center min-h-[400px]">
                    <Spin size="large" className="text-orange-700" />
                </div>
            </div>
        );
    }

    if (error && !admin) {
        return (
            <div className="container mx-auto">
                <Alert
                    message="Error Loading Profile"
                    description={error}
                    type="error"
                    showIcon
                    action={
                        <Button size="small" danger onClick={onRetry}>
                            Retry
                        </Button>
                    }
                />
            </div>
        );
    }

    return (
        <div className="container mx-auto justify-center items-center">
            {/* Header */}
            <div className="mb-8 text-center">
                <Title level={2} className="text-gray-800 mb-2 mt-0 text-xl md:text-3xl">
                    Profile Settings
                </Title>
                <Text className="text-gray-600 text-sm md:text-base">
                    Manage your account information and security settings
                </Text>
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
                <Col xs={24} lg={8}>
                    {/* Profile Picture Card */}
                    <Card className="shadow-lg border-0 bg-white mb-6" styles={{ body: { padding: "16px" } }}>
                        <div className="text-center">
                            {/* Profile Image with Camera Badge */}
                            <div className="relative inline-block mb-6">
                                <Avatar
                                    src={admin?.profileImageUrl}
                                    icon={<User className="w-8 h-8" />}
                                    size={120}
                                    className="border-4 border-orange-100"
                                />
                                {uploadingImage && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                                        <Spin size="small" />
                                    </div>
                                )}

                                {/* Camera Badge */}
                                <Upload
                                    accept="image/*"
                                    showUploadList={false}
                                    beforeUpload={(file) => {
                                        onImageUpload(file);
                                        return false; // Prevent default upload
                                    }}
                                >
                                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-orange-700 rounded-full flex items-center justify-center cursor-pointer hover:bg-orange-800 transition-colors duration-200 shadow-lg border-2 border-white">
                                        <Camera className="w-5 h-5 text-white" />
                                    </div>
                                </Upload>
                            </div>

                            {/* Account Status */}
                            <div className="mt-6">
                                <Badge
                                    status={getAccountStatus(admin?.enabled || false).status}
                                    text={
                                        <Text className="text-xs sm:text-sm">
                                            Account {getAccountStatus(admin?.enabled || false).text}
                                        </Text>
                                    }
                                />
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <Divider />
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Text className="text-gray-600 text-xs sm:text-sm">Member Since</Text>
                                <Text strong className="text-xs sm:text-sm">
                                    {admin?.createdAt ? formatEpochDate(admin.createdAt) : "N/A"}
                                </Text>
                            </div>
                            <div className="flex items-center justify-between">
                                <Text className="text-gray-600 text-xs sm:text-sm">NRIC</Text>
                                <Text strong className="text-xs sm:text-sm">
                                    {admin?.nric || "N/A"}
                                </Text>
                            </div>
                        </div>
                    </Card>


                </Col>

                <Col xs={24} lg={16}>
                    {/* Profile Information Card */}
                    <Card className="shadow-lg border-0 bg-white" styles={{ body: { padding: "32px" } }}>
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center">
                                <User className="w-6 h-6 text-orange-500 mr-3" />
                                <Title level={3} className="m-0 text-gray-800">
                                    Profile Information
                                </Title>
                            </div>

                            {!isEditing ? (
                                <Button
                                    type="primary"
                                    icon={<Edit className="w-4 h-4" />}
                                    onClick={onToggleEditMode}
                                    className="bg-orange-700 hover:bg-orange-800 border-orange-700"
                                >
                                    Edit Profile
                                </Button>
                            ) : (
                                <div className="flex space-x-2">
                                    <Button onClick={onCancelEdit}>Cancel</Button>
                                    <Button
                                        type="primary"
                                        icon={<Save className="w-4 h-4" />}
                                        loading={saving}
                                        onClick={() => form.submit()}
                                        className="bg-orange-700 hover:bg-orange-800 border-orange-700"
                                    >
                                        Save Changes
                                    </Button>
                                </div>
                            )}
                        </div>

                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={onUpdateProfile}
                            requiredMark={false}
                            disabled={!isEditing}
                        >
                            <Row gutter={[16, 16]}>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label={
                                            <span className="text-sm font-medium text-gray-700 flex items-center">
                                                <User className="mr-2 text-orange-500" size={18} strokeWidth={2.2} />
                                                Full Name
                                                <Tooltip title="Enter your complete name as it appears on official documents">
                                                    <Info className="ml-2 text-orange-500 cursor-pointer" size={16} />
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
                                            className="h-12 rounded-xl border-gray-200 hover:border-orange-700 focus:border-orange-700 transition-colors"
                                            size="large"
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label={
                                            <span className="text-sm font-medium text-gray-700 flex items-center">
                                                <Mail className="mr-2 text-orange-500" size={18} strokeWidth={2.2} />
                                                Email Address
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
                                            className={`h-12 rounded-xl border-gray-200 transition-colors ${isEditing
                                                ? "bg-gray-50 cursor-not-allowed border-gray-300"
                                                : "hover:border-orange-700 focus:border-orange-700"
                                                }`}
                                            size="large"
                                            disabled={true}
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label={
                                            <span className="text-sm font-medium text-gray-700 flex items-center">
                                                <Phone className="mr-2 text-orange-500" size={18} strokeWidth={2.2} />
                                                Phone Number
                                                <Tooltip title="Malaysian phone number (e.g., 0112223333)">
                                                    <Info className="ml-2 text-orange-500 cursor-pointer" size={16} />
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
                                            className="h-12 rounded-xl border-gray-200 hover:border-orange-700 focus:border-orange-700 transition-colors"
                                            size="large"
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default ProfilePageComponent; 