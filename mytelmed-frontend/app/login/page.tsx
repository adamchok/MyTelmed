"use client";

import { message } from "antd";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDispatch } from "react-redux";
import AuthApi from "../api/auth";
import LoginPageComponent from "./component";

const SignIn = () => {
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
    await AuthApi.login(body)
      .then((response) => {
        if (response.isSuccess && response.data) {
          message.success("Successfully Sign In");
          localStorage.setItem("accessToken", response.data.accessToken);
          localStorage.setItem("refreshToken", response.data.refreshToken);
          localStorage.setItem("isLogin", "true");
          dispatch({ type: "SET_LOGIN_STATUS", payload: true });
          router.push("/dashboard");
        } else {
          const errorMessage =
            response.message || "Sign-in failed, please try again";
          message.error(errorMessage);
        }
      })
      .catch((err) => {
        const errorMessage = "Sign-in failed, please try again";
        message.error(errorMessage);
        console.log(err);
      })
      .finally(() => {
        setIsLoggingIn(false);
      });
  };

  return (
    <div>
      <LoginPageComponent onFinish={onFinish} />
    </div>
  );
};

export default SignIn;
