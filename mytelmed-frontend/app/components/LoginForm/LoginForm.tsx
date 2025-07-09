"use client";

import { Button, Form, Input, Typography } from "antd";
import { useRouter } from "next/navigation";
import BackButton from "../BackButton/BackButton";
import { User, Stethoscope, Pill, Shield } from "lucide-react";

const { Title, Text } = Typography;

interface LoginFormProps {
  userType: 'patient' | 'doctor' | 'pharmacist' | 'admin';
  onFinish: (values: any) => void;
  isLoading?: boolean;
}

const userTypeConfig = {
  patient: {
    title: "Patient Login",
    subtitle: "Access your medical records and book appointments",
    icon: <User className="w-8 h-8" />,
    color: "blue",
    gradientFrom: "from-blue-500",
    gradientTo: "to-blue-700",
    bgColor: "bg-blue-50",
    registerLink: "/patient/register/user-info"
  },
  doctor: {
    title: "Doctor Login",
    subtitle: "Manage your patients and consultations",
    icon: <Stethoscope className="w-8 h-8" />,
    color: "green",
    gradientFrom: "from-green-500",
    gradientTo: "to-green-700",
    bgColor: "bg-green-50",
    registerLink: null
  },
  pharmacist: {
    title: "Pharmacist Login",
    subtitle: "Process prescriptions and manage inventory",
    icon: <Pill className="w-8 h-8" />,
    color: "purple",
    gradientFrom: "from-purple-500",
    gradientTo: "to-purple-700",
    bgColor: "bg-purple-50",
    registerLink: null
  },
  admin: {
    title: "Admin Login",
    subtitle: "System administration and management",
    icon: <Shield className="w-8 h-8" />,
    color: "red",
    gradientFrom: "from-red-500",
    gradientTo: "to-red-700",
    bgColor: "bg-red-50",
    registerLink: null
  }
};

const LoginForm = ({ userType, onFinish, isLoading = false }: LoginFormProps) => {
  const [form] = Form.useForm();
  const router = useRouter();
  const config = userTypeConfig[userType];

  return (
    <div className={`min-h-screen ${config.bgColor} flex items-center justify-center p-4`}>
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className={`bg-gradient-to-r ${config.gradientFrom} ${config.gradientTo} p-6 text-center`}>
            <div className="flex justify-center mb-4">
              <div className="bg-white rounded-full p-3 shadow-lg">
                <div className={`text-${config.color}-600`}>
                  {config.icon}
                </div>
              </div>
            </div>
            <Title level={2} className="text-white mb-2 text-2xl font-bold">
              {config.title}
            </Title>
            <Text className="text-white/90">
              {config.subtitle}
            </Text>
          </div>

          {/* Form */}
          <div className="p-8">
            <BackButton backLink="/" className="mb-6" />

            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              autoComplete="off"
              size="large"
            >
              <Form.Item
                label={userType === 'patient' ? 'NRIC' : 'Username'}
                name="username"
                rules={[{ required: true, message: `${userType === 'patient' ? 'NRIC' : 'Username'} is required` }]}
              >
                <Input
                  placeholder={userType === 'patient' ? 'Enter your NRIC' : 'Enter your username'}
                  className="rounded-lg"
                />
              </Form.Item>

              <Form.Item
                label="Password"
                name="password"
                rules={[{ required: true, message: "Password is required" }]}
              >
                <Input.Password
                  placeholder="Enter your password"
                  className="rounded-lg"
                />
              </Form.Item>

              <Form.Item className="mb-4">
                <Button
                  type="primary"
                  htmlType="submit"
                  className={`w-full h-12 rounded-lg font-semibold bg-gradient-to-r ${config.gradientFrom} ${config.gradientTo} border-none hover:shadow-lg transition-all duration-300`}
                  loading={isLoading}
                >
                  Sign In
                </Button>
              </Form.Item>

              {config.registerLink && (
                <Form.Item className="mb-4">
                  <Button
                    type="default"
                    className="w-full h-12 rounded-lg font-semibold border-gray-300 hover:border-gray-400"
                    onClick={() => router.push(config.registerLink)}
                  >
                    Create New Account
                  </Button>
                </Form.Item>
              )}

              <div className="text-center">
                <Button
                  type="link"
                  className={`text-${config.color}-600 hover:text-${config.color}-700`}
                  onClick={() => router.push('/forgot/password')}
                >
                  Forgot Password?
                </Button>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
