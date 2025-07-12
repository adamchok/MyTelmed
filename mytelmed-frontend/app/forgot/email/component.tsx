"use client";

import { Button, Form, Input, Modal, Tooltip, Typography, Image, Select } from "antd";
import { ForgotEmailPageComponentProps } from "./props";
import { useState } from "react";
import { InfoCircleOutlined } from "@ant-design/icons";
import { Mail, User, CreditCard, Phone, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const { Title, Text } = Typography;
const { Option } = Select;

const ForgotEmailPageComponent = ({
    form,
    onFinish,
    isSubmitting,
    onUserTypeChange,
}: ForgotEmailPageComponentProps) => {
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const router = useRouter();
    const MALAYSIAN_PHONE_REGEX = /01[0-46-9]\d{7,8}$/;

    // Watch the userType field value from the form
    const currentUserType = Form.useWatch("userType", form);

    // Handle back button click
    const handleBackClick = (e: React.MouseEvent) => {
        e.preventDefault();
        router.push("/forgot/password");
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
                            Reset Your Email
                        </Title>
                        <Text className="text-gray-500 text-xs sm:text-sm">
                            Enter your details to receive a link to reset your email address.
                        </Text>
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
                                    <User className="mr-2 text-blue-500 w-3 h-3 sm:w-4 sm:h-4" strokeWidth={2} />
                                    User Type
                                </span>
                            }
                            name="userType"
                            rules={[{ required: true, message: "Please select your user type" }]}
                        >
                            <Select
                                placeholder="Select your user type"
                                className="h-10 sm:h-12 text-sm sm:text-base"
                                style={{ borderRadius: "8px" }}
                                onChange={onUserTypeChange}
                            >
                                <Option value="PATIENT">Patient</Option>
                                <Option value="DOCTOR">Doctor</Option>
                                <Option value="PHARMACIST">Pharmacist</Option>
                                <Option value="ADMIN">Admin</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label={
                                <span className="text-xs sm:text-sm font-medium text-gray-700 flex items-center">
                                    <User className="mr-2 text-blue-500 w-3 h-3 sm:w-4 sm:h-4" strokeWidth={2} />
                                    <span className="hidden sm:inline">Full Name (as stated in NRIC)</span>
                                    <span className="sm:hidden">Full Name</span>
                                </span>
                            }
                            name="name"
                            rules={[{ required: true, message: "Please enter your full name as stated in NRIC" }]}
                        >
                            <Input
                                placeholder="Enter your full name"
                                className="h-10 sm:h-12 rounded-lg sm:rounded-xl border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors text-sm sm:text-base"
                            />
                        </Form.Item>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                            <Form.Item
                                label={
                                    <span className="text-xs sm:text-sm font-medium text-gray-700 flex items-center">
                                        <CreditCard
                                            className="mr-2 text-blue-500 w-3 h-3 sm:w-4 sm:h-4"
                                            strokeWidth={2}
                                        />
                                        <span className="hidden sm:inline">NRIC (without hyphens)</span>
                                        <span className="sm:hidden">NRIC</span>
                                    </span>
                                }
                                name="nric"
                                rules={[
                                    { required: true, message: "Please enter your NRIC" },
                                    {
                                        pattern: /^\d{12}$/,
                                        message: "NRIC must be exactly 12 digits without hyphens",
                                    },
                                ]}
                                normalize={(value) => {
                                    // Remove any non-digit characters
                                    return value ? value.replace(/\D/g, "") : value;
                                }}
                            >
                                <Input
                                    maxLength={12}
                                    placeholder="Enter your NRIC"
                                    className="h-10 sm:h-12 rounded-lg sm:rounded-xl border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors text-sm sm:text-base"
                                />
                            </Form.Item>

                            <Form.Item
                                label={
                                    <span className="text-xs sm:text-sm font-medium text-gray-700 flex items-center">
                                        <CreditCard
                                            className="mr-2 text-blue-500 w-3 h-3 sm:w-4 sm:h-4"
                                            strokeWidth={2}
                                        />
                                        <span className="hidden sm:inline">NRIC Serial Number</span>
                                        <span className="sm:hidden">Serial Number</span>
                                        <Tooltip title="Click to see where to find this on your NRIC">
                                            <InfoCircleOutlined
                                                className="text-blue-500 ml-1 sm:ml-2 cursor-pointer hover:text-blue-600 transition-colors w-3 h-3 sm:w-4 sm:h-4"
                                                onClick={() => setIsModalVisible(true)}
                                            />
                                        </Tooltip>
                                    </span>
                                }
                                name="serialNumber"
                                rules={[
                                    {
                                        required: currentUserType === "PATIENT",
                                        message: "Please enter your NRIC's Serial Number",
                                    },
                                    {
                                        pattern: /^[A-Za-z0-9]{10}$/,
                                        message: "Serial number must be exactly 10 alphanumeric characters",
                                    },
                                ]}
                                style={{ display: currentUserType === "PATIENT" ? "block" : "none" }}
                            >
                                <Input
                                    maxLength={10}
                                    placeholder="Enter your NRIC's Serial Number"
                                    className="h-10 sm:h-12 rounded-lg sm:rounded-xl border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors text-sm sm:text-base"
                                />
                            </Form.Item>
                        </div>

                        <Form.Item
                            label={
                                <span className="text-xs sm:text-sm font-medium text-gray-700 flex items-center">
                                    <Phone className="mr-2 text-blue-500 w-3 h-3 sm:w-4 sm:h-4" strokeWidth={2} />
                                    <span className="hidden sm:inline">Phone Number (without hyphens)</span>
                                    <span className="sm:hidden">Phone Number</span>
                                    <Tooltip title="Example: 0112223333">
                                        <InfoCircleOutlined className="text-blue-500 ml-1 sm:ml-2 cursor-pointer hover:text-blue-600 transition-colors w-3 h-3 sm:w-4 sm:h-4" />
                                    </Tooltip>
                                </span>
                            }
                            name="phone"
                            rules={[
                                { required: true, message: "Please enter your phone number" },
                                {
                                    pattern: MALAYSIAN_PHONE_REGEX,
                                    message: "Please enter a valid Malaysian phone number (10 digits without hyphens)",
                                },
                            ]}
                            normalize={(value) => {
                                // Remove any non-digit characters
                                return value ? value.replace(/\D/g, "") : value;
                            }}
                        >
                            <Input
                                maxLength={10}
                                placeholder="Enter your phone number"
                                prefix={<span className="text-gray-500 font-medium text-xs sm:text-sm">+6</span>}
                                className="h-10 sm:h-12 rounded-lg sm:rounded-xl border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors text-sm sm:text-base"
                            />
                        </Form.Item>

                        <Form.Item
                            label={
                                <span className="text-xs sm:text-sm font-medium text-gray-700 flex items-center">
                                    <Mail className="mr-2 text-blue-500 w-3 h-3 sm:w-4 sm:h-4" strokeWidth={2} />
                                    New Email Address
                                </span>
                            }
                            name="email"
                            rules={[
                                { required: true, message: "Please enter your new email address" },
                                { type: "email", message: "Please enter a valid email address" },
                            ]}
                        >
                            <Input
                                placeholder="Enter your new email address"
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
                                loading={isSubmitting}
                                disabled={isSubmitting}
                                className="h-10 sm:h-12 px-8 sm:px-12 rounded-lg sm:rounded-xl bg-blue-700 border-0 hover:bg-blue-900 font-medium shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
                            >
                                {isSubmitting ? "Submitting..." : "Submit Request"}
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

            {/* Enhanced Modal */}
            <Modal
                open={isModalVisible}
                title={
                    <div className="flex items-center space-x-2 sm:space-x-3 p-2">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                            <CreditCard className="text-white w-4 h-4 sm:w-6 sm:h-6" strokeWidth={2} />
                        </div>
                        <span className="text-lg sm:text-xl font-semibold text-gray-800">
                            NRIC Serial Number Location
                        </span>
                    </div>
                }
                footer={null}
                onCancel={() => setIsModalVisible(false)}
                centered
                width={700}
                className="rounded-2xl"
                styles={{
                    content: { borderRadius: "16px", overflow: "hidden" },
                    header: { borderBottom: "1px solid #f0f0f0", padding: "16px 20px" },
                }}
            >
                <div className="p-4 sm:p-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
                        <p className="text-gray-600 text-center mb-3 sm:mb-4 text-sm sm:text-base">
                            The serial number is located at the bottom right corner of your NRIC, as highlighted in the
                            image below:
                        </p>
                        <div className="flex items-center justify-center">
                            <div className="bg-white rounded-lg sm:rounded-xl p-2 sm:p-4 shadow-lg">
                                <Image
                                    src="/assets/images/nric-serial-location-example.png"
                                    alt="NRIC Serial Number Location"
                                    width={500}
                                    preview={false}
                                    className="rounded-lg w-full h-auto"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="text-center">
                        <Button
                            type="primary"
                            onClick={() => setIsModalVisible(false)}
                            className="h-9 sm:h-10 px-4 sm:px-6 rounded-lg bg-blue-600 border-0 font-medium text-sm sm:text-base"
                        >
                            Got it, thanks!
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ForgotEmailPageComponent;
