'use client'

import { useRouter } from 'next/navigation';
import { message } from 'antd';
import { EmailResetLinkRequestOptions } from '@/app/api/auth/props';
import { EmailResetResponse } from './props';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import ForgotEmailPageComponent from './component';
import AuthApi from '@/app/api/auth';


const ForgotEmail = () => {
  const router: AppRouterInstance = useRouter();

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
    const emailResetRequest: EmailResetLinkRequestOptions = {
      nric: values.nric,
      name: values.name,
      phone: values.phone,
      serialNumber: values.serialNumber,
      email: values.email,
    }
    try {
      const response = await AuthApi.requestEmailReset(emailResetRequest);
      const { isSuccess, message: msg }: EmailResetResponse = response.data;

      if (isSuccess) {
        message.success(msg);
        router.push("/login");
      } else {
        message.error(msg);
      }
    } catch (err: any) {
      message.error(err?.response?.data?.message ?? "Failed to send email reset link. Please try again.");
    }
  };

  return <ForgotEmailPageComponent onFinish={onFinish} />;
};

export default ForgotEmail;
