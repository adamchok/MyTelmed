'use client'

import { Form, Input, Button, Select, DatePicker, Tooltip, Modal, Image } from "antd";
import BackButton from "@/app/components/BackButton/BackButton";
import { UserInfoPageComponentProps } from "./props";
import Title from "antd/es/typography/Title";
import dayjs from "dayjs";
import { useState } from 'react';
import { InfoCircleOutlined } from '@ant-design/icons';

const { Option } = Select;

const UserInfoPageComponent = ({ form, onFinish, userInfo, handleCancel }: UserInfoPageComponentProps) => {
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  return (
    <div className="flex justify-center items-center mt-8">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg px-8 pb-8">
        <BackButton backLink="/" className="mt-8" />
        <Title level={2} className="text-center mb-8 text-blue-900 font-bold">Register: Personal Info</Title>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            ...userInfo,
            dob: userInfo.dob ? dayjs(userInfo.dob) : undefined,
          }}
          onFinish={onFinish}
        >
          <Form.Item
            label="Full Name (as stated in NRIC)"
            name="name"
            rules={[{ required: true, message: "Please enter your full name as stated in NRIC" }]}
          >
            <Input placeholder="Enter your full name" />
          </Form.Item>
          <Form.Item
            label="NRIC (without hyphens)"
            name="nric"
            rules={[{ required: true, message: "Please enter your NRIC" }]}
          >
            <Input placeholder="Enter your NRIC" />
          </Form.Item>
          <Form.Item
            label={
              <span>
                NRIC Serial Number
                <Tooltip title="Where to find?">
                  <InfoCircleOutlined
                    className="text-blue-900 ml-2 cursor-pointer"
                    onClick={() => setIsModalVisible(true)}
                  />
                </Tooltip>
              </span>
            }
            name="serialNumber"
            rules={[{ required: true, message: "Please enter your NRIC's Serial Number" }]}
          >
            <Input placeholder="Enter your NRIC's Serial Number" />
          </Form.Item>
          <Form.Item
            label="Phone Number (without hyphens)"
            name="phone"
            rules={[
              { required: true, message: "Please enter your phone number" },
              { pattern: /^1[0-46-9]-?[0-9]{7,8}$/, message: "Please enter a valid Malaysian phone number" }
            ]}
          >
            <Input placeholder="Enter your phone number" prefix="+60" />
          </Form.Item>
          <div className="flex justify-evenly gap-0 md:flex-row md:gap-4 flex-col">
            <Form.Item
              label="Gender"
              name="gender"
              rules={[{ required: true, message: "Please select your gender" }]}
              className="w-full flex-1"
            >
              <Select placeholder="Select gender" className="w-full">
                <Option value="male">Male</Option>
                <Option value="female">Female</Option>
              </Select>
            </Form.Item>
            <Form.Item
              label="Date of Birth (YYYY-MM-DD)"
              name="dob"
              rules={[{ required: true, message: "Please select your date of birth" }]}
              className="w-full flex-1"
            >
              <DatePicker className="w-full" format="YYYY-MM-DD" placeholder="Select date of birth" />
            </Form.Item>
          </div>
          <Form.Item>
            <div className="flex justify-between gap-4 mt-2 md:flex-row flex-col">
              <Button
                type="default"
                className="w-full bg-red-700 hover:bg-red-800 font-bold text-white"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                className="w-full bg-blue-700 hover:bg-blue-800 font-bold">
                Next
              </Button>
            </div>
          </Form.Item>
        </Form>
      </div>
      <Modal
        open={isModalVisible}
        title="Where to find your NRIC Serial Number"
        footer={null}
        onCancel={() => setIsModalVisible(false)}
        onClose={() => setIsModalVisible(false)}
        centered
      >
        <div className="flex items-center justify-center my-4">
          <Image
            src="/icons/nric-serial-location-example.png"
            alt="NRIC Serial Number Location"
            width={250}
            preview={false}
            className="bg-transparent"
          />
        </div>
      </Modal>
    </div>
  );
};

export default UserInfoPageComponent;
