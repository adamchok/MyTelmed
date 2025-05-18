"use client";

import { Button, Col, Form, Input, Row, Typography } from "antd";
import { useRouter } from "next/navigation";
import { ForgotPasswordPageComponentProps } from "./props";
import BackButton from "../../components/BackButton/BackButton";
import "./index.css";

const { Title, Paragraph } = Typography;

const ForgotPasswordPageComponent = ({ onFinish }: ForgotPasswordPageComponentProps) => {
  const [form] = Form.useForm();
  const router = useRouter();

  return (
    <div className="flex items-center justify-center mt-8">
      <div className="w-[450px] h-auto bg-white rounded-lg shadow-lg px-8 pb-8">
        <BackButton backLink="/" className="mt-6" />
        <Title level={2} className="font-bold text-2xl mb-4 text-center text-blue-900">Forgot Password</Title>
        <Paragraph className="text-gray-600 mt-2 mb-6 text-center">
          Enter your account&apos;s NRIC number and email address and we will email you a link to reset your password.
        </Paragraph>
        <Form
          form={form}
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          onFinish={onFinish}
          variant="filled"
          autoComplete="off"
        >
          <Row>
            <Col span={24}>
              <Form.Item
                label="NRIC"
                name="nric"
                className="form-text mb-4"
                rules={[
                  { required: true, message: 'Please input your NRIC Number' }
                ]}
              >
                <Input placeholder="Enter your NRIC Number" className="h-10" />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label="Email Address"
                name="email"
                className="form-text mb-8"
                rules={[
                  { required: true, message: 'Please input your email' },
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              >
                <Input placeholder="Enter your email" className="h-10" />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                style={{ marginBottom: 10 }}
              >
                <Button
                  type="primary"
                  htmlType="submit"
                  className="w-full font-bold h-9"
                >
                  <p className="text-[15px] font-bold">Send Reset Link</p>
                </Button>
              </Form.Item>
            </Col>

            <Col span={24}>
              <div className="flex flex-row justify-end">
                <Button
                  type="link"
                  onClick={() => router.push('/forgot/email')}
                  className="link email-reset-link"
                >
                  Forgot Email?
                </Button>
              </div>
            </Col>
          </Row>
        </Form>
      </div>
    </div>
  );
};

export default ForgotPasswordPageComponent;
