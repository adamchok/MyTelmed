'use client'

import { Button, Form, Input } from "antd";
import { CreatePasswordPageProps } from "./props";
import Title from "antd/es/typography/Title";
import BackButton from "@/app/components/BackButton/BackButton";

const CreatePasswordPageComponent = ({ form, onFinish, loading, handleCancel }: CreatePasswordPageProps) => {
  return (
    <div className="flex justify-center items-center mt-8">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg px-8 pb-8">
        <BackButton backLink="/register/verify-email" className="mt-8" />
        <Title level={2} className="text-center mb-6 text-blue-900 font-bold">Create Your Password</Title>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: true, message: "Please enter your password" },
              { min: 6, message: "Password must be at least 6 characters" },
            ]}
            hasFeedback
          >
            <Input.Password placeholder="Create your password" />
          </Form.Item>
          <Form.Item
            label="Confirm Password"
            name="confirmPassword"
            dependencies={["password"]}
            hasFeedback
            rules={[
              { required: true, message: "Please confirm your password" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Passwords do not match!"));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Confirm your password" />
          </Form.Item>
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
                Complete Registration
              </Button>
            </div>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}

export default CreatePasswordPageComponent;
