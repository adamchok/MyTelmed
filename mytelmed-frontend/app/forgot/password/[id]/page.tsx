"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Form, Input, Button, Typography, message } from "antd";
import { CreatePasswordFormProps, PasswordResetResponse } from "../props";
import AuthApi from "@/app/api/auth";
import { ResetPasswordRequestOptions } from "@/app/api/auth/props";

const { Title, Paragraph } = Typography;

export default function CreatePasswordPage() {
  const [form] = Form.useForm();
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: CreatePasswordFormProps) => {
    if (!id) {
      message.error("Invalid password reset link.");
      return;
    } else if (!values.password) {
      message.error("Please enter your new password.");
      return;
    } else if (!values.confirmPassword) {
      message.error("Please confirm your new password.");
      return;
    } else if (values.password !== values.confirmPassword) {
      message.error("Passwords do not match.");
      return;
    }
    const resetPasswordRequest: ResetPasswordRequestOptions = {
      id: id as string,
      password: values.password,
    }
    try {
      setLoading(true);
      const response = await AuthApi.resetPassword(resetPasswordRequest);
      const { isSuccess, message: msg }: PasswordResetResponse = response.data;

      if (isSuccess) {
        message.success(msg);
        router.push("/login");
      } else {
        message.error(msg);
      }
    } catch (err: any) {
      message.error(err?.response?.data?.message ?? "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center mt-8">
      <div className="w-[450px] h-auto bg-white rounded-lg shadow-lg px-8 pb-8">
        <Title level={2} className="font-bold text-2xl mb-4 text-center text-blue-900">Create New Password</Title>
        <Paragraph className="text-gray-600 mt-2 mb-6 text-center">
          Please enter your new password below.
        </Paragraph>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            label="New Password"
            name="password"
            rules={[{ required: true, message: "Please input your new password!" }]}
            hasFeedback
          >
            <Input.Password className="h-10" placeholder="Enter new password" />
          </Form.Item>
          <Form.Item
            label="Confirm Password"
            name="confirmPassword"
            dependencies={["password"]}
            hasFeedback
            rules={[
              { required: true, message: "Please confirm your password!" },
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
            <Input.Password className="h-10" placeholder="Confirm new password" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full font-bold h-9" loading={loading}>
              Reset Password
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
