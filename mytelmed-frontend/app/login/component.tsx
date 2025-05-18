"use client";

import { Button, Form, Input, Row, Col, Typography } from "antd";
import { ComponentProps } from "./props";
import { useRouter } from "next/navigation";
import BackButton from "../components/BackButton/BackButton";
import "./index.css";

const { Title } = Typography;

const LoginPageComponent = ({ onFinish }: ComponentProps) => {
  const [form] = Form.useForm();
  const router = useRouter();

  return (
    <div className="flex items-center justify-center mt-8">
      <div className="w-[450px] bg-white rounded-lg shadow-lg px-8 pb-8">
        <BackButton backLink="/" className="mt-8" />
        <div className="flex flex-col">
          <Title level={2} className="font-bold text-2xl mb-6 mt-8 text-center text-blue-900">Login to MyTelmed</Title>
          <Form
            form={form}
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
            onFinish={onFinish}
            variant="filled"
            autoComplete="off"
            initialValues={{ remember: true }}
          >
            <Row>
              <Col span={24}>
                <Form.Item
                  label="NRIC"
                  name="username"
                  className="form-text mb-4"
                  rules={[{ required: true, message: "NRIC is required" }]}
                >
                  <Input placeholder="Enter your NRIC" className="h-10" />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  label="Password"
                  name="password"
                  className="form-text mb-8"
                  rules={[{ required: true, message: "Password is required" }]}
                >
                  <Input.Password placeholder="Enter your password" className="h-10" />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  style={{ marginBottom: 10 }}
                >
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="w-full font-bold action-btn"
                  >
                    <p className="text-[15px] font-bold">Log In</p>
                  </Button>
                </Form.Item>
              </Col>

              <Col span={24}>
                <Button
                  type="default"
                  className="w-full font-bold action-btn register-btn"
                  onClick={() => router.push('/register/user-info')}
                >
                  <p className="text-[15px] font-bold">
                    Register new account
                  </p>
                </Button>
              </Col>

              <Col span={24} className="mt-1">
                <div className="auth-links">
                  <Button
                    type="link"
                    className="auth-link"
                    onClick={() => router.push('/forgot/password')}
                  >
                    Forgot Password?
                  </Button>
                </div>
              </Col>
            </Row>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default LoginPageComponent;
