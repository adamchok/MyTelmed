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
    DatePicker,
    Select,
    Avatar,
    Upload,
    Alert,
    Divider,
    Spin,
    Badge,
    Tooltip,
} from "antd";
import { User, Mail, Phone, Calendar, Edit, Save, Camera, Shield, Info } from "lucide-react";
import dayjs from "dayjs";
import { ProfileComponentProps } from "./props";

const { Title, Text } = Typography;

const ProfilePageComponent = ({
    patient,
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

    // Set form values when patient data changes
    useEffect(() => {
        if (patient) {
            form.setFieldsValue({
                name: patient.name,
                email: patient.email,
                phone: patient.phone,
                dateOfBirth: patient.dateOfBirth ? dayjs(patient.dateOfBirth) : null,
                gender: patient.gender,
            });
        }
    }, [patient, form]);

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
                    <Spin size="large" />
                </div>
            </div>
        );
    }

    if (error && !patient) {
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
            <div className="flex justify-between items-center mb-8">
                <div>
                    <Title level={2} className="text-gray-800 mb-2 mt-0 text-lg sm:text-xl md:text-3xl">
                        My Profile
                    </Title>
                    <Text className="text-gray-600 text-xs sm:text-sm md:text-base">
                        Manage your personal information and account settings
                    </Text>
                </div>
                {!isEditing && (
                    <div className="hidden md:block">
                        <Button
                            type="primary"
                            icon={<Edit className="w-4 h-4" />}
                            onClick={onToggleEditMode}
                            size="middle"
                        >
                            Edit Profile
                        </Button>
                    </div>
                )}
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

            <Row gutter={[24, 24]}>
                {/* Left Column - Profile Image and Basic Info */}
                <Col xs={24} lg={8}>
                    <Card className="shadow-lg border-0 bg-white h-full" styles={{ body: { padding: "16px" } }}>
                        <div className="text-center">
                            {/* Profile Image with Camera Badge */}
                            <div className="relative inline-block mb-6">
                                <Avatar
                                    src={patient?.profileImageUrl}
                                    icon={<User className="w-8 h-8" />}
                                    size={120}
                                    className="border-4 border-blue-100"
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
                                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-colors duration-200 shadow-lg border-2 border-white">
                                        <Camera className="w-5 h-5 text-white" />
                                    </div>
                                </Upload>
                            </div>

                            {/* Account Status */}
                            <div className="mt-6">
                                <Badge
                                    status={getAccountStatus(patient?.enabled || false).status}
                                    text={
                                        <Text className="text-xs sm:text-sm">
                                            Account {getAccountStatus(patient?.enabled || false).text}
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
                                    {patient?.createdAt ? formatEpochDate(patient.createdAt) : "N/A"}
                                </Text>
                            </div>
                            <div className="flex items-center justify-between">
                                <Text className="text-gray-600 text-xs sm:text-sm">Serial Number</Text>
                                <Text strong className="text-blue-600 text-xs sm:text-sm">
                                    {patient?.serialNumber || "N/A"}
                                </Text>
                            </div>
                            <div className="flex items-center justify-between">
                                <Text className="text-gray-600 text-xs sm:text-sm">NRIC</Text>
                                <Text strong className="text-xs sm:text-sm">
                                    {patient?.nric || "N/A"}
                                </Text>
                            </div>
                        </div>
                    </Card>
                </Col>

                {/* Right Column - Profile Form */}
                <Col xs={24} lg={16}>
                    <Card className="shadow-lg border-0 bg-white h-full" styles={{ body: { padding: "16px" } }}>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center">
                                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 mr-2 sm:mr-3" />
                                <Title level={4} className="m-0 text-gray-800 text-base sm:text-lg">
                                    Personal Information
                                </Title>
                            </div>
                        </div>

                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={onUpdateProfile}
                            disabled={!isEditing}
                            className="space-y-6"
                            requiredMark={isEditing}
                        >
                            <Row gutter={[16, 16]}>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label={
                                            <span className="text-xs sm:text-sm font-medium text-gray-700 flex items-center">
                                                <User className="mr-2 text-blue-500" size={16} strokeWidth={2.2} />
                                                Full Name
                                            </span>
                                        }
                                        name="name"
                                        rules={[
                                            { required: true, message: "Please enter your full name" },
                                            { min: 2, message: "Name must be at least 2 characters" },
                                        ]}
                                    >
                                        <Input
                                            placeholder="Enter your full name"
                                            className="h-10 sm:h-12 rounded-xl border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors"
                                            size="large"
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label={
                                            <span className="text-xs sm:text-sm font-medium text-gray-700 flex items-center">
                                                <Mail className="mr-2 text-blue-500" size={16} strokeWidth={2.2} />
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
                                            placeholder="Enter your email"
                                            className="h-10 sm:h-12 rounded-xl border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors"
                                            size="large"
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label={
                                            <span className="text-xs sm:text-sm font-medium text-gray-700 flex items-center">
                                                <Phone className="mr-2 text-blue-500" size={16} strokeWidth={2.2} />
                                                Phone Number (without hyphens)
                                                <Tooltip title="Example: 0112223333">
                                                    <Info className="text-blue-500 ml-2 cursor-pointer hover:text-blue-600 transition-colors" />
                                                </Tooltip>
                                            </span>
                                        }
                                        name="phone"
                                        rules={[
                                            { required: true, message: "Please enter your phone number" },
                                            {
                                                pattern: /^01[0-46-9]\d{7,8}$/,
                                                message:
                                                    "Please enter a valid Malaysian phone number (10 digits without hyphens)",
                                            },
                                        ]}
                                        normalize={(value) => {
                                            // Remove any non-digit characters
                                            return value ? value.replace(/\D/g, "") : value;
                                        }}
                                    >
                                        <Input
                                            placeholder="Enter your phone number"
                                            prefix={
                                                <span className="text-gray-500 font-medium text-xs sm:text-sm">+6</span>
                                            }
                                            className="h-10 sm:h-12 rounded-xl border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors"
                                            size="large"
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label={
                                            <span className="text-xs sm:text-sm font-medium text-gray-700 flex items-center">
                                                <Calendar className="mr-2 text-blue-500" size={16} strokeWidth={2.2} />
                                                Date of Birth
                                            </span>
                                        }
                                        name="dateOfBirth"
                                        rules={[{ required: true, message: "Please select your date of birth" }]}
                                    >
                                        <DatePicker
                                            placeholder="Select date of birth"
                                            className="w-full h-10 sm:h-12 rounded-xl border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors"
                                            format="YYYY-MM-DD"
                                            disabledDate={(current) => {
                                                return current && current > dayjs().endOf("day");
                                            }}
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label={
                                            <span className="text-xs sm:text-sm font-medium text-gray-700 flex items-center">
                                                <User className="mr-2 text-blue-500" size={16} strokeWidth={2.2} />
                                                Gender
                                            </span>
                                        }
                                        name="gender"
                                        rules={[{ required: true, message: "Please select your gender" }]}
                                    >
                                        <Select
                                            placeholder="Select gender"
                                            className="h-10 sm:h-12"
                                            style={{ borderRadius: "12px" }}
                                            options={[
                                                { value: "MALE", label: "Male" },
                                                { value: "FEMALE", label: "Female" },
                                            ]}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            {/* Form Actions */}
                            {isEditing && (
                                <div className="flex justify-end space-x-2 sm:space-x-4 py-4 sm:py-6 border-t border-gray-100">
                                    <Button size="middle" onClick={onCancelEdit} disabled={saving}>
                                        Cancel
                                    </Button>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        size="middle"
                                        loading={saving}
                                        icon={<Save className="w-4 h-4" />}
                                    >
                                        Save Changes
                                    </Button>
                                </div>
                            )}
                        </Form>

                        {/* Mobile Edit Profile Button - Outside Form to avoid disabled state */}
                        {!isEditing && (
                            <div className="md:hidden flex justify-center py-4 sm:py-6 border-t border-gray-100">
                                <Button
                                    type="primary"
                                    icon={<Edit className="w-4 h-4" />}
                                    onClick={onToggleEditMode}
                                    size="middle"
                                    className="w-full max-w-xs"
                                >
                                    Edit Profile
                                </Button>
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default ProfilePageComponent;
