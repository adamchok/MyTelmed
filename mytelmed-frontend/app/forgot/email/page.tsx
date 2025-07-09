"use client";

import { useRouter } from "next/navigation";
import { message } from "antd";
import { InitiateEmailResetRequestDto } from "@/app/api/reset/props";
import ForgotEmailPageComponent from "./component";
import ResetApi from "@/app/api/reset";

const ForgotEmail = () => {
  const router = useRouter();

  const onFinish = async (values: any) => {
    if (!values.email) {
      message.error("Please enter your email first.");
      return;
    } else if (!values.nric) {
      message.error("Please enter your IC number first.");
      return;
    } else if (!values.name) {
      message.error("Please enter your name first.");
      return;
    } else if (!values.phone) {
      message.error("Please enter your phone number first.");
      return;
    } else if (!values.serialNumber) {
      message.error("Please enter your serial number first.");
      return;
    }
    const emailResetRequest: InitiateEmailResetRequestDto = {
      nric: values.nric,
      name: values.name,
      phone: values.phone,
      serialNumber: values.serialNumber,
      email: values.email,
    };
    try {
      const response = await ResetApi.initiateEmailReset(emailResetRequest);

      const responseData = response.data;

      if (responseData.isSuccess) {
        message.success(
          responseData.message || "Email reset link sent successfully."
        );
        router.push("/login");
      } else {
        message.error(responseData.message || "Failed to send email reset link.");
      }
    } catch (err: any) {
      message.error(
        err?.response?.data?.message ??
        "Failed to send email reset link. Please try again."
      );
    }
  };

  return <ForgotEmailPageComponent onFinish={onFinish} />;
};

export default ForgotEmail;
