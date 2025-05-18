"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Form, Input, Button, Typography, message } from "antd";
import { CreateEmailFormProps, EmailResetResponse } from "../props";
import { ResetEmailRequestOptions } from "@/app/api/auth/props";
import Auth from "@/app/api/auth";

const { Title, Paragraph } = Typography;

export default function CreateEmailPage() {
  const [form] = Form.useForm();
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: CreateEmailFormProps) => {
    if (!id) {
      message.error("Invalid email reset link.");
      return;
    } else if (!values.email) {
      message.error("Please enter your new email.");
      return;
    } else if (!values.confirmEmail) {
      message.error("Please confirm your new email.");
      return;
    } else if (values.email !== values.confirmEmail) {
      message.error("Emails do not match.");
      return;
    }
    const resetEmailRequest: ResetEmailRequestOptions = {
      id: id as string,
      email: values.email,
    }
    try {
      setLoading(true);
      const response = await Auth.resetEmail(resetEmailRequest);
      const { isSuccess, message: msg }: EmailResetResponse = response.data;

      if (isSuccess) {
        message.success(msg);
        router.push("/login");
      } else {
        message.error(msg);
      }
    } catch (err: any) {
      message.error(err?.response?.data?.message ?? "Failed to reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center mt-8">
      <div className="w-[450px] h-auto bg-white rounded-lg shadow-lg px-8 pb-8">
        <Title level={2} className="font-bold text-2xl mb-4 text-center text-blue-900">Create New Email</Title>
        <Paragraph className="text-gray-600 mt-2 mb-6 text-center">
          Please enter your new email below.
        </Paragraph>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            label="New Email"
            name="email"
            rules={[{ required: true, message: "Please input your new email!" }]}
            hasFeedback
          >
            <Input className="h-10" placeholder="Enter new email" />
          </Form.Item>
          <Form.Item
            label="Confirm Email"
            name="confirmEmail"
            dependencies={["email"]}
            hasFeedback
            rules={[
              { required: true, message: "Please confirm your email!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("email") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Emails do not match!"));
                },
              }),
            ]}
          >
            <Input className="h-10" placeholder="Confirm new email" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full font-bold h-9" loading={loading}>
              Reset Email
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
