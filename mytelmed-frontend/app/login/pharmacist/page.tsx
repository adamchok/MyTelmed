"use client";

import { message } from "antd";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDispatch } from "react-redux";
import AuthApi from "../../api/auth";
import LoginForm from "../../components/LoginForm/LoginForm";

const PharmacistLogin = () => {
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
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
      const response = await AuthApi.loginPharmacist(body);
      const responseData = response.data;

      if (responseData.isSuccess && responseData.data) {
        message.success("Successfully signed in as pharmacist");
        localStorage.setItem("accessToken", responseData.data.accessToken);
        localStorage.setItem("refreshToken", responseData.data.refreshToken);
        localStorage.setItem("isLogin", "true");
        localStorage.setItem("userType", "pharmacist");
        dispatch({ type: "SET_LOGIN_STATUS", payload: true });

        // Redirect to pharmacist dashboard
        router.push("/pharmacist/dashboard");
      } else {
        const errorMessage = responseData.message || "Sign-in failed, please try again";
        message.error(errorMessage);
      }
    } catch (err) {
      const errorMessage = "Sign-in failed, please try again";
      message.error(errorMessage);
      console.log(err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <LoginForm
      userType="pharmacist"
      onFinish={onFinish}
      isLoading={isLoggingIn}
    />
  );
};

export default PharmacistLogin;
