"use client";

import { Form, Input, Button, Select, DatePicker, Tooltip, Modal, Image, Typography } from "antd";
import { UserInfoPageComponentProps } from "./props";
import dayjs from "dayjs";
import { useState } from "react";
import { User, CreditCard, Phone, Calendar, Info, ArrowLeft } from "lucide-react";

const { Title, Text } = Typography;

const { Option } = Select;

const UserInfoPageComponent = ({ form, onFinish, userInfo, handleCancel }: UserInfoPageComponentProps) => {
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

    // Function to validate minimum age of 13 years
    const validateAge = (_: any, value: any) => {
        if (!value) {
            return Promise.reject(new Error("Please select your date of birth"));
        }

        const today = dayjs();
        const birthDate = dayjs(value);
        const age = today.diff(birthDate, "years");

        if (age < 13) {
            return Promise.reject(new Error("You must be at least 13 years old to register"));
        }

        return Promise.resolve();
    };

    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-blue-700 py-10 sm:py-12 md:py-16 px-3 sm:px-8">
            {/* User Details Card */}
            <div className="relative z-10 w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl">
                <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-blue-900/20 p-3 sm:p-4 md:p-6 lg:p-8">
                    <div className="text-center mb-4 sm:mb-6">
                        <Title
                            level={3}
                            className="mb-2 text-blue-700 text-lg sm:text-xl md:text-2xl lg:text-3xl flex items-center justify-center"
                        >
                            <User className="text-blue-600 w-8 h-8 mr-3" strokeWidth={2} />
                            Tell Us About Yourself
                        </Title>
                        <Text className="text-gray-500 text-xs sm:text-sm md:text-base">
                            We need some basic information to create your MyTelmed account
                        </Text>
                    </div>
                    <Form
                        form={form}
                        layout="vertical"
                        initialValues={{
                            ...userInfo,
                            dob: userInfo.dob ? dayjs(userInfo.dob) : undefined,
                        }}
                        onFinish={onFinish}
                        className="space-y-3 sm:space-y-4"
                    >
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
                                            <Info
                                                className="text-blue-500 ml-1 sm:ml-2 cursor-pointer hover:text-blue-600 transition-colors w-3 h-3 sm:w-4 sm:h-4"
                                                strokeWidth={2}
                                                onClick={() => setIsModalVisible(true)}
                                            />
                                        </Tooltip>
                                    </span>
                                }
                                name="serialNumber"
                                rules={[
                                    { required: true, message: "Please enter your NRIC's Serial Number" },
                                    {
                                        pattern: /^[A-Za-z0-9]{10}$/,
                                        message: "Serial number must be exactly 10 alphanumeric characters",
                                    },
                                ]}
                            >
                                <Input
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
                                        <Info
                                            className="text-blue-500 ml-1 sm:ml-2 cursor-pointer hover:text-blue-600 transition-colors w-3 h-3 sm:w-4 sm:h-4"
                                            strokeWidth={2}
                                        />
                                    </Tooltip>
                                </span>
                            }
                            name="phone"
                            rules={[
                                { required: true, message: "Please enter your phone number" },
                                {
                                    pattern: /^01[0-46-9]\d{7,8}$/,
                                    message: "Please enter a valid Malaysian phone number (10 digits without hyphens)",
                                },
                            ]}
                            normalize={(value) => {
                                // Remove any non-digit characters
                                return value ? value.replace(/\D/g, "") : value;
                            }}
                        >
                            <Input
                                placeholder="Enter your phone number"
                                prefix={<span className="text-gray-500 font-medium text-xs sm:text-sm">+6</span>}
                                className="h-10 sm:h-12 rounded-lg sm:rounded-xl border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors text-sm sm:text-base"
                            />
                        </Form.Item>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                            <Form.Item
                                label={
                                    <span className="text-xs sm:text-sm font-medium text-gray-700 flex items-center">
                                        <User className="mr-2 text-blue-500 w-3 h-3 sm:w-4 sm:h-4" strokeWidth={2} />
                                        Gender
                                    </span>
                                }
                                name="gender"
                                rules={[{ required: true, message: "Please select your gender" }]}
                            >
                                <Select
                                    placeholder="Select gender"
                                    className="h-10 sm:h-12 text-sm sm:text-base"
                                    style={{ borderRadius: "8px" }}
                                >
                                    <Option value="male">Male</Option>
                                    <Option value="female">Female</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item
                                label={
                                    <span className="text-xs sm:text-sm font-medium text-gray-700 flex items-center">
                                        <Calendar
                                            className="mr-2 text-blue-500 w-3 h-3 sm:w-4 sm:h-4"
                                            strokeWidth={2}
                                        />
                                        <span className="hidden sm:inline">Date of Birth</span>
                                        <span className="sm:hidden">Date of Birth</span>
                                        <span className="text-xs text-gray-500 ml-1 sm:ml-2">(13+ years)</span>
                                    </span>
                                }
                                name="dob"
                                rules={[
                                    { required: true, message: "Please select your date of birth" },
                                    { validator: validateAge },
                                ]}
                            >
                                <DatePicker
                                    className="w-full h-10 sm:h-12 rounded-lg sm:rounded-xl border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors text-sm sm:text-base"
                                    format="YYYY-MM-DD"
                                    placeholder="Select date of birth"
                                />
                            </Form.Item>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end">
                            <Button
                                type="default"
                                onClick={handleCancel}
                                className="h-10 sm:h-12 px-6 sm:px-8 rounded-lg sm:rounded-xl border-2 border-gray-200 hover:border-red-400 hover:text-red-500 font-medium transition-all duration-300 hover:shadow-lg text-sm sm:text-base"
                            >
                                <ArrowLeft className="w-4 h-4" strokeWidth={2} /> Back to Home
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                className="h-10 sm:h-12 px-8 sm:px-12 rounded-lg sm:rounded-xl bg-blue-700 border-0 hover:bg-blue-900 font-medium shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
                            >
                                Continue to Next Step
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
                    <div className="flex items-center justify-center space-x-2">
                        <span className="text-gray-200 text-xs sm:text-sm">Already have an account?</span>
                        <Button
                            type="link"
                            className="text-blue-200 hover:text-white font-medium p-0 h-auto text-xs sm:text-sm"
                            onClick={() => (window.location.href = "/login/patient")}
                        >
                            Sign in here
                        </Button>
                    </div>
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

export default UserInfoPageComponent;
