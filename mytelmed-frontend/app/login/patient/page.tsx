"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { Form, Input, Button, Typography, message } from "antd";
import { User, Lock, UserCircle, ArrowLeft } from "lucide-react";
import AuthApi from "../../api/auth";

const { Title, Text } = Typography;

const PatientLogin = () => {
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [form] = Form.useForm();
    const router = useRouter();
    const dispatch = useDispatch();

    const onFinish = async (values: any) => {
        if (isLoggingIn) return;
        setIsLoggingIn(true);
        const body = {
            username: values.username,
            password: values.password,
        };
        try {
            const response = await AuthApi.loginPatient(body);
            const responseData = response.data;
            if (responseData.isSuccess && responseData.data) {
                message.success("Successfully signed in as patient");
                localStorage.setItem("accessToken", responseData.data.accessToken);
                localStorage.setItem("refreshToken", responseData.data.refreshToken);
                localStorage.setItem("isLogin", "true");
                localStorage.setItem("userType", "patient");
                dispatch({ type: "SET_LOGIN_STATUS", payload: true });
                router.push("/patient/dashboard");
            } else {
                const errorMessage = responseData.message || "Sign-in failed, please try again";
                message.error(errorMessage);
            }
        } catch (err) {
            message.error("Sign-in failed, please try again");
            console.log(err);
        } finally {
            setIsLoggingIn(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-blue-700 py-8 px-4">
            {/* Login Card */}
            <div className="relative z-10 w-full max-w-md">
                <div className="bg-white rounded-3xl shadow-2xl border border-blue-900/20 p-8 md:p-12">
                    <div className="text-center mb-8">
                        <UserCircle className="text-blue-600" size={48} strokeWidth={2.2} />
                        <Title level={3} className="mb-2 text-blue-700">
                            Patient Sign In
                        </Title>
                        <Text className="text-gray-500">Sign in to access your patient dashboard</Text>
                    </div>
                    <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off" className="space-y-6">
                        <Form.Item
                            label={
                                <span className="text-sm font-medium text-gray-700 flex items-center">
                                    <User className="mr-2 text-blue-700" size={18} strokeWidth={2.2} /> IC Number
                                </span>
                            }
                            name="username"
                            rules={[{ required: true, message: "IC number is required" }]}
                        >
                            <Input
                                placeholder="Enter your IC number"
                                className="h-12 rounded-xl border-gray-200 hover:border-blue-700 focus:border-blue-800 transition-colors"
                                size="large"
                                autoFocus
                            />
                        </Form.Item>
                        <Form.Item
                            label={
                                <span className="text-sm font-medium text-gray-700 flex items-center">
                                    <Lock className="mr-2 text-blue-700" size={18} strokeWidth={2.2} /> Password
                                </span>
                            }
                            name="password"
                            rules={[{ required: true, message: "Password is required" }]}
                        >
                            <Input.Password
                                placeholder="Enter your password"
                                className="h-12 rounded-xl border-gray-200 hover:border-blue-700 focus:border-blue-800 transition-colors"
                                size="large"
                            />
                        </Form.Item>
                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={isLoggingIn}
                                className="h-12 w-full rounded-xl bg-blue-700 border-0 hover:bg-blue-900 font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                                size="large"
                            >
                                Sign In
                            </Button>
                        </Form.Item>
                        <div className="flex justify-between items-center text-center">
                            <Button
                                type="link"
                                className="text-gray-700 hover:underline font-medium transition-colors px-0"
                                onClick={() => router.push("/")}
                            >
                                <ArrowLeft size={18} strokeWidth={2.2} /> Back to Home
                            </Button>
                            <Button
                                type="link"
                                className="text-blue-700 hover:text-blue-900 hover:underline font-medium transition-colors px-0"
                                onClick={() => router.push("/forgot/password")}
                            >
                                Forgot Password?
                            </Button>
                        </div>
                    </Form>
                </div>
                <div className="text-center mt-8">
                    <p className="text-gray-200 text-sm">
                        Your login credentials are encrypted and secure. We use industry-standard security measures to
                        protect your account.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PatientLogin;
