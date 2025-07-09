"use client";

import { message } from "antd";
import { useRouter } from "next/navigation";
import { InitiatePasswordResetRequestDto } from "@/app/api/reset/props";
import ForgotPasswordPageComponent from "./component";
import ResetApi from "@/app/api/reset";

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
    const passwordResetRequest: InitiatePasswordResetRequestDto = {
      nric: values.nric,
      email: values.email,
    };
    try {
      const response = await ResetApi.initiatePasswordReset(
        passwordResetRequest
      );
      const responseData = response.data;

      if (responseData.isSuccess) {
        message.success(
          responseData.message || "Password reset link sent successfully."
        );
        router.push("/login");
      } else {
        message.error(
          responseData.message || "Failed to send password reset link."
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
