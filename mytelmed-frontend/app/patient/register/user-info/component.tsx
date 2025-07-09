'use client'

import { Form, Input, Button, Select, DatePicker, Tooltip, Modal, Image } from "antd";
import BackButton from "@/app/components/BackButton/BackButton";
import { UserInfoPageComponentProps } from "./props";
import Title from "antd/es/typography/Title";
import dayjs from "dayjs";
import { useState } from 'react';
import { InfoCircleOutlined, UserOutlined, IdcardOutlined, PhoneOutlined, CalendarOutlined } from '@ant-design/icons';

const { Option } = Select;

const UserInfoPageComponent = ({ form, onFinish, userInfo, handleCancel }: UserInfoPageComponentProps) => {
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  // Function to validate minimum age of 13 years
  const validateAge = (_: any, value: any) => {
    if (!value) {
      return Promise.reject(new Error('Please select your date of birth'));
    }

    const today = dayjs();
    const birthDate = dayjs(value);
    const age = today.diff(birthDate, 'years');

    if (age < 13) {
      return Promise.reject(new Error('You must be at least 13 years old to register'));
    }

    return Promise.resolve();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-400 to-blue-500 rounded-full opacity-10 blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto">
        <BackButton backLink="/" className="mb-6" />

        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-lg">
            <UserOutlined className="text-3xl text-white" />
          </div>
          <Title level={1} className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Tell Us About Yourself
          </Title>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            We need some basic information to create your MyTelmed account and ensure secure access to healthcare services.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 md:p-12">
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              ...userInfo,
              dob: userInfo.dob ? dayjs(userInfo.dob) : undefined,
            }}
            onFinish={onFinish}
            className="space-y-6"
          >
            {/* Personal Information Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full" />
                <h3 className="text-xl font-semibold text-gray-800">Personal Information</h3>
              </div>

              <Form.Item
                label={
                  <span className="text-sm font-medium text-gray-700 flex items-center">
                    <UserOutlined className="mr-2 text-blue-500" />
                    Full Name (as stated in NRIC)
                  </span>
                }
                name="name"
                rules={[{ required: true, message: "Please enter your full name as stated in NRIC" }]}
              >
                <Input
                  placeholder="Enter your full name"
                  className="h-12 rounded-xl border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors"
                />
              </Form.Item>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Form.Item
                  label={
                    <span className="text-sm font-medium text-gray-700 flex items-center">
                      <IdcardOutlined className="mr-2 text-blue-500" />
                      NRIC (without hyphens)
                    </span>
                  }
                  name="nric"
                  rules={[{ required: true, message: "Please enter your NRIC" }]}
                >
                  <Input
                    placeholder="Enter your NRIC"
                    className="h-12 rounded-xl border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors"
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <span className="text-sm font-medium text-gray-700 flex items-center">
                      <IdcardOutlined className="mr-2 text-blue-500" />
                      NRIC Serial Number
                      <Tooltip title="Click to see where to find this on your NRIC">
                        <InfoCircleOutlined
                          className="text-blue-500 ml-2 cursor-pointer hover:text-blue-600 transition-colors"
                          onClick={() => setIsModalVisible(true)}
                        />
                      </Tooltip>
                    </span>
                  }
                  name="serialNumber"
                  rules={[{ required: true, message: "Please enter your NRIC's Serial Number" }]}
                >
                  <Input
                    placeholder="Enter your NRIC's Serial Number"
                    className="h-12 rounded-xl border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors"
                  />
                </Form.Item>
              </div>

              <Form.Item
                label={
                  <span className="text-sm font-medium text-gray-700 flex items-center">
                    <PhoneOutlined className="mr-2 text-blue-500" />
                    Phone Number (without hyphens)
                    <Tooltip title="Example: 0112223333">
                      <InfoCircleOutlined className="text-blue-500 ml-2 cursor-pointer hover:text-blue-600 transition-colors" />
                    </Tooltip>
                  </span>
                }
                name="phone"
                rules={[
                  { required: true, message: "Please enter your phone number" },
                  { pattern: /^01[0-46-9]-?[0-9]{7,8}$/, message: "Please enter a valid Malaysian phone number" }
                ]}
              >
                <Input
                  placeholder="Enter your phone number"
                  prefix={<span className="text-gray-500 font-medium">+60</span>}
                  className="h-12 rounded-xl border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors"
                />
              </Form.Item>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Form.Item
                  label={
                    <span className="text-sm font-medium text-gray-700 flex items-center">
                      <UserOutlined className="mr-2 text-blue-500" />
                      Gender
                    </span>
                  }
                  name="gender"
                  rules={[{ required: true, message: "Please select your gender" }]}
                >
                  <Select
                    placeholder="Select gender"
                    className="h-12"
                    style={{ borderRadius: '12px' }}
                  >
                    <Option value="male">Male</Option>
                    <Option value="female">Female</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  label={
                    <span className="text-sm font-medium text-gray-700 flex items-center">
                      <CalendarOutlined className="mr-2 text-blue-500" />
                      Date of Birth
                      <span className="text-xs text-gray-500 ml-2">(Must be 13+ years old)</span>
                    </span>
                  }
                  name="dob"
                  rules={[
                    { required: true, message: "Please select your date of birth" },
                    { validator: validateAge }
                  ]}
                >
                  <DatePicker
                    className="w-full h-12 rounded-xl border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors"
                    format="YYYY-MM-DD"
                    placeholder="Select date of birth"
                  />
                </Form.Item>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-8 border-t border-gray-100">
              <div className="flex flex-col md:flex-row gap-4 justify-end">
                <Button
                  type="default"
                  onClick={handleCancel}
                  className="h-12 px-8 rounded-xl border-2 border-gray-200 hover:border-red-400 hover:text-red-500 font-medium transition-all duration-300 hover:shadow-lg"
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="h-12 px-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 border-0 hover:from-blue-600 hover:to-purple-700 font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Continue to Next Step
                </Button>
              </div>
            </div>
          </Form>
        </div>

        {/* Help Text */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            Your information is encrypted and secure. We comply with Malaysian healthcare data protection standards.
          </p>
        </div>
      </div>

      {/* Enhanced Modal */}
      <Modal
        open={isModalVisible}
        title={
          <div className="flex items-center space-x-3 p-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <IdcardOutlined className="text-white text-lg" />
            </div>
            <span className="text-xl font-semibold text-gray-800">NRIC Serial Number Location</span>
          </div>
        }
        footer={null}
        onCancel={() => setIsModalVisible(false)}
        centered
        width={700}
        className="rounded-2xl"
        styles={{
          content: { borderRadius: '16px', overflow: 'hidden' },
          header: { borderBottom: '1px solid #f0f0f0', padding: '20px 24px' }
        }}
      >
        <div className="p-6">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 mb-6">
            <p className="text-gray-600 text-center mb-4">
              The serial number is located at the bottom right corner of your NRIC, as highlighted in the image below:
            </p>
            <div className="flex items-center justify-center">
              <div className="bg-white rounded-xl p-4 shadow-lg">
                <Image
                  src="/assets/images/nric-serial-location-example.png"
                  alt="NRIC Serial Number Location"
                  width={500}
                  preview={false}
                  className="rounded-lg"
                />
              </div>
            </div>
          </div>
          <div className="text-center">
            <Button
              type="primary"
              onClick={() => setIsModalVisible(false)}
              className="h-10 px-6 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 border-0 font-medium"
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
