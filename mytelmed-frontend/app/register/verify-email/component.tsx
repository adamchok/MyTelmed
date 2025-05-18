'use client'

import { Form, Input, Button } from "antd";
import BackButton from "@/app/components/BackButton/BackButton";
import { VerifyEmailPageComponentProps } from "./props";
import Title from "antd/es/typography/Title";

const VerifyEmailPageComponent = ({ form, onFinish, handleCancel, email, loading, resendCooldown, handleSendCode }: VerifyEmailPageComponentProps) => {
  return (
    <div className="flex justify-center items-center mt-8">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg px-8 pb-8">
        <BackButton backLink="/register/user-info" className="mt-8" />
        <Title level={2} className="text-center mb-6 text-blue-900 font-bold">Verify Your Email</Title>
        <Form
          form={form}
          layout="vertical"
          initialValues={{ email: email }}
          onFinish={onFinish}
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input placeholder="Enter your email" />
          </Form.Item>
          <Form.Item
            label="Verification Code"
            name="code"
            rules={[{ required: true, message: "Please enter the verification code sent to your email" }]}
          >
            <Input placeholder="Enter verification code" />
          </Form.Item>
          <div className="mb-4 text-right">
            <Button
              type="link"
              onClick={handleSendCode}
              disabled={resendCooldown > 0}
              className="p-0"
              loading={loading}
            >
              {resendCooldown > 0 ? `Resend Code (${resendCooldown}s)` : "Send/Resend Code"}
            </Button>
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
                className="w-full bg-blue-700 hover:bg-blue-800 font-bold"
                loading={loading}
              >
                Next
              </Button>
            </div>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default VerifyEmailPageComponent;
