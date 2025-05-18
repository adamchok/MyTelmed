"use client";

import { message } from "antd";
import { useRouter } from "next/navigation";
import { PasswordResetLinkRequestOptions } from "@/app/api/auth/props";
import { PasswordResetResponse } from "./props";
import ForgotPasswordPageComponent from "./component";
import Auth from "@/app/api/auth";

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
    const passwordResetRequest: PasswordResetLinkRequestOptions = {
      nric: values.nric,
      email: values.email,
    }
    try {
      const response = await Auth.requestPasswordReset(passwordResetRequest);
      const { isSuccess, message: msg }: PasswordResetResponse = response.data;

      if (isSuccess) {
        message.success(msg);
        router.push("/login");
      } else {
        message.error(msg);
      }
    } catch (err: any) {
      message.error(err?.response?.data?.message ?? "Failed to send password reset link. Please try again.");
    }
  };

  return (
    <div>
      <ForgotPasswordPageComponent onFinish={onFinish} />
    </div>
  );
};

export default ForgotPassword;