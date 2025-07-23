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
    Image,
} from "antd";
import { User, Mail, Phone, Calendar, Edit, Save, Camera, Shield, Info, Building2, MapPin, Building } from "lucide-react";
import dayjs from "dayjs";
import { ProfileComponentProps } from "./props";

const { Title, Text } = Typography;

// Define languages in one place as the single source of truth
const LANGUAGE_MAP: Record<string, string> = {
    "ENGLISH": "English",
    "MANDARIN": "Mandarin",
    "MALAY": "Malay",
    "TAMIL": "Tamil"
};

// Generate Select options from the language map
const LANGUAGE_OPTIONS = Object.entries(LANGUAGE_MAP).map(([value, label]) => ({
    value,
    label
}));

const ProfilePageComponent = ({
    doctor,
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

    // Set form values when doctor data changes
    useEffect(() => {
        if (doctor) {
            form.setFieldsValue({
                name: doctor.name,
                email: doctor.email,
                phone: doctor.phone,
                dateOfBirth: doctor.dateOfBirth ? dayjs(doctor.dateOfBirth, "DD/MM/YYYY") : null,
                gender: doctor.gender.toUpperCase(),
                languageList: doctor.languageList?.map((language) => language.toUpperCase()) || [],
                qualifications: doctor.qualifications || "",
            });
        }
    }, [doctor, form]);

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

    // Map language codes to display names
    const mapLanguageCode = (code: string): string => {
        if (code) {
            return LANGUAGE_MAP[code.toString().toUpperCase()] || code;
        }
        return "N/A";
    };

    if (loading) {
        return (
            <div className="container mx-auto">
                <div className="flex justify-center items-center min-h-[400px]">
                    <Spin size="large" className="text-green-700" />
                </div>
            </div>
        );
    }

    if (error && !doctor) {
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
                            className="bg-green-700 hover:bg-green-800 border-green-700"
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
                                    src={doctor?.profileImageUrl}
                                    icon={<User className="w-8 h-8" />}
                                    size={120}
                                    className="border-4 border-green-100"
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
                                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-700 rounded-full flex items-center justify-center cursor-pointer hover:bg-green-800 transition-colors duration-200 shadow-lg border-2 border-white">
                                        <Camera className="w-5 h-5 text-white" />
                                    </div>
                                </Upload>
                            </div>

                            {/* Account Status */}
                            <div className="mt-6">
                                <Badge
                                    status={getAccountStatus(doctor?.enabled || false).status}
                                    text={
                                        <Text className="text-xs sm:text-sm">
                                            Account {getAccountStatus(doctor?.enabled || false).text}
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
                                    {doctor?.createdAt ? formatEpochDate(doctor.createdAt) : "N/A"}
                                </Text>
                            </div>
                            <div className="flex items-center justify-between">
                                <Text className="text-gray-600 text-xs sm:text-sm">NRIC</Text>
                                <Text strong className="text-xs sm:text-sm">
                                    {doctor?.nric || "N/A"}
                                </Text>
                            </div>
                        </div>

                        {/* Professional Information */}
                        <Divider />
                        <div className="space-y-4">
                            <div>
                                <Text className="text-gray-600 text-xs sm:text-sm block mb-2">Languages</Text>
                                <div className="flex flex-wrap gap-1">
                                    {doctor?.languageList && doctor.languageList.length > 0 ? (
                                        doctor.languageList.map((language, index) => (
                                            <span
                                                key={index}
                                                className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                                            >
                                                {mapLanguageCode(language)}
                                            </span>
                                        ))
                                    ) : (
                                        <Text className="text-gray-400 text-xs">No languages specified</Text>
                                    )}
                                </div>
                            </div>
                            {doctor?.qualifications && (
                                <div>
                                    <Text className="text-gray-600 text-xs sm:text-sm block mb-2">Qualifications</Text>
                                    <Text className="text-xs sm:text-sm text-gray-800">
                                        {doctor.qualifications}
                                    </Text>
                                </div>
                            )}
                        </div>
                    </Card>
                </Col>

                {/* Right Column - Profile Form */}
                <Col xs={24} lg={16}>
                    <Card className="shadow-lg border-0 bg-white h-full" styles={{ body: { padding: "16px" } }}>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center">
                                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-green-700 mr-2 sm:mr-3" />
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
                                                <User className="mr-2 text-green-700" size={16} strokeWidth={2.2} />
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
                                            className="h-10 sm:h-12 rounded-xl border-gray-200 hover:border-green-700 focus:border-green-700 transition-colors"
                                            size="large"
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label={
                                            <span className="text-xs sm:text-sm font-medium text-gray-700 flex items-center">
                                                <Mail className="mr-2 text-green-700" size={16} strokeWidth={2.2} />
                                                Email Address
                                            </span>
                                        }
                                        name="email"
                                    >
                                        <Input
                                            placeholder="Enter your email"
                                            className="h-10 sm:h-12 rounded-xl border-gray-200 bg-gray-50 cursor-not-allowed"
                                            size="large"
                                            disabled={true}
                                            title="Email address cannot be changed"
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label={
                                            <span className="text-xs sm:text-sm font-medium text-gray-700 flex items-center">
                                                <Phone className="mr-2 text-green-700" size={16} strokeWidth={2.2} />
                                                Phone Number (without hyphens)
                                                <Tooltip title="Example: 0112223333">
                                                    <Info className="text-green-700 ml-2 cursor-pointer hover:text-green-800 transition-colors" />
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
                                            className="h-10 sm:h-12 rounded-xl border-gray-200 hover:border-green-700 focus:border-green-700 transition-colors"
                                            size="large"
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label={
                                            <span className="text-xs sm:text-sm font-medium text-gray-700 flex items-center">
                                                <Calendar className="mr-2 text-green-700" size={16} strokeWidth={2.2} />
                                                Date of Birth
                                            </span>
                                        }
                                        name="dateOfBirth"
                                        rules={[{ required: true, message: "Please select your date of birth" }]}
                                    >
                                        <DatePicker
                                            placeholder="Select date of birth"
                                            className="w-full h-10 sm:h-12 rounded-xl border-gray-200 hover:border-green-700 focus:border-green-700 transition-colors"
                                            format="DD/MM/YYYY"
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
                                                <User className="mr-2 text-green-700" size={16} strokeWidth={2.2} />
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

                            {/* Doctor-specific fields */}
                            <Row gutter={[16, 16]}>
                                <Col span={24}>
                                    <Form.Item
                                        label={
                                            <span className="text-xs sm:text-sm font-medium text-gray-700 flex items-center">
                                                <Building2 className="mr-2 text-green-700" size={16} strokeWidth={2.2} />
                                                Languages
                                            </span>
                                        }
                                        name="languageList"
                                    >
                                        <Select
                                            mode="tags"
                                            placeholder="Enter languages you speak"
                                            className="w-full h-10 sm:h-12 rounded-xl border-gray-200 hover:border-green-700 focus:border-green-700 transition-colors"
                                            options={LANGUAGE_OPTIONS}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={[16, 16]}>
                                <Col span={24}>
                                    <Form.Item
                                        label={
                                            <span className="text-xs sm:text-sm font-medium text-gray-700 flex items-center">
                                                <Info className="mr-2 text-green-700" size={16} strokeWidth={2.2} />
                                                Qualifications
                                            </span>
                                        }
                                        name="qualifications"
                                    >
                                        <Input.TextArea
                                            placeholder="Enter your medical qualifications and certifications"
                                            className="rounded-xl border-gray-200 hover:border-green-700 focus:border-green-700 transition-colors"
                                            rows={5}
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
                                        className="bg-green-700 hover:bg-green-800 border-green-700"
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
                                    className="w-full max-w-xs bg-green-700 hover:bg-green-800 border-green-700"
                                >
                                    Edit Profile
                                </Button>
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>

            {/* Facility Details Section */}
            {doctor?.facility && (
                <Row gutter={[24, 24]} className="mt-8">
                    <Col span={24}>
                        <Card className="shadow-lg border-0 bg-white" styles={{ body: { padding: "16px" } }}>
                            <div className="flex items-center mb-6">
                                <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-700 mr-2 sm:mr-3" />
                                <Title level={4} className="m-0 text-gray-800 text-base sm:text-lg">
                                    My Facility
                                </Title>
                            </div>

                            <Row gutter={[24, 24]} align="top">
                                {/* Facility Image */}
                                <Col xs={24} sm={8} md={6} lg={4}>
                                    <div className="flex justify-center sm:justify-start">
                                        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden border-2 border-green-100 bg-gray-50 flex items-center justify-center">
                                            {doctor.facility.thumbnailUrl ? (
                                                <Image
                                                    src={doctor.facility.thumbnailUrl}
                                                    alt={doctor.facility.name}
                                                    className="w-full h-full object-cover"
                                                    loading="eager"
                                                />
                                            ) : (
                                                <Building className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" />
                                            )}
                                        </div>
                                    </div>
                                </Col>

                                {/* Facility Details */}
                                <Col xs={24} sm={16} md={18} lg={20}>
                                    <div className="space-y-4">
                                        {/* Facility Name and Type */}
                                        <div className="space-y-2">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                                <Title level={5} className="m-0 text-gray-800 text-sm sm:text-base">
                                                    {doctor.facility.name}
                                                </Title>
                                                <div className="inline-flex">
                                                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs sm:text-sm font-medium rounded-full">
                                                        {doctor.facility.facilityType.replace('_', ' ')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Contact Information */}
                                        <Row gutter={[16, 16]}>
                                            <Col xs={24} sm={12} lg={8}>
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                                        <Phone className="w-4 h-4 text-green-700" />
                                                    </div>
                                                    <div>
                                                        <Text className="text-gray-600 text-xs block">Phone</Text>
                                                        <Text strong className="text-xs sm:text-sm">
                                                            {doctor.facility.telephone}
                                                        </Text>
                                                    </div>
                                                </div>
                                            </Col>

                                            <Col xs={24} sm={12} lg={16}>
                                                <div className="flex items-start space-x-3">
                                                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mt-1">
                                                        <MapPin className="w-4 h-4 text-green-700" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <Text className="text-gray-600 text-xs block">Address</Text>
                                                        <div className="space-y-1">
                                                            <Text strong className="text-xs sm:text-sm block">
                                                                {doctor.facility.address}
                                                            </Text>
                                                            <Text className="text-gray-600 text-xs sm:text-sm">
                                                                {doctor.facility.city}, {doctor.facility.state}
                                                            </Text>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Col>
                                        </Row>
                                    </div>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>
            )}
        </div>
    );
};

export default ProfilePageComponent;
