"use client";

import { message } from "antd";
import { useRouter } from "next/navigation";
import { InitiatePasswordResetRequestOptions } from "@/app/api/auth/props";
import ForgotPasswordPageComponent from "./component";
import AuthApi from "@/app/api/auth";

const ForgotPassword = () => {
  const router = useRouter();

  const onFinish = async (values: any) => {
    if (!values.email) {
      message.error("Please enter your email first.");
      return;
    } else if (!values.nric) {
      message.error("Please enter your IC number first.");
      return;
    }
    const passwordResetRequest: InitiatePasswordResetRequestOptions = {
      nric: values.nric,
      email: values.email,
    };
    try {
      const response = await AuthApi.initiatePasswordReset(
        passwordResetRequest
      );

      if (response.isSuccess) {
        message.success(
          response.message || "Password reset link sent successfully."
        );
        router.push("/login");
      } else {
        message.error(
          response.message || "Failed to send password reset link."
        );
      }
    } catch (err: any) {
      message.error(
        err?.response?.data?.message ??
          "Failed to send password reset link. Please try again."
      );
    }
  };

  return (
    <div>
      <ForgotPasswordPageComponent onFinish={onFinish} />
    </div>
  );
};

export default ForgotPassword;
