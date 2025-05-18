"use client";

import { useDispatch, useSelector } from "react-redux";
import { Form, message } from "antd";
import { resetRegistration } from "@/lib/reducers/registration-reducer";
import type { RootState } from "@/lib/reducers";
import { Dispatch, useState } from "react";
import Auth from "@/app/api/auth";
import CreatePasswordPageComponent from "./component";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useRouter } from "next/navigation";
import { RegistrationRequestOptions } from "@/app/api/auth/props";
import { RegistrationResponse } from "./props";

export default function CreatePasswordPage() {
  const dispatch: Dispatch<any> = useDispatch();
  const router: AppRouterInstance = useRouter();
  const { userInfo, email } = useSelector((state: RootState) => state.rootReducer.registration);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    if (!values.password) {
      message.error("Please enter your password first.");
      return;
    } else if (values.password !== values.confirmPassword) {
      message.error("Passwords do not match.");
      return;
    }
    const registrationRequest: RegistrationRequestOptions = {
      name: userInfo.name,
      nric: userInfo.nric,
      serialNumber: userInfo.serialNumber,
      email: email,
      phone: userInfo.phone,
      gender: userInfo.gender,
      dob: userInfo.dob,
      password: values.password
    }
    try {
      setLoading(true);
      const response = await Auth.register(registrationRequest);
      const { isSuccess, message: msg }: RegistrationResponse = response.data;

      if (isSuccess) {
        message.success(msg);
        dispatch(resetRegistration());
        router.push("/login");
      } else {
        message.error(msg);
      }
    } catch (err: any) {
      message.error(err?.response?.data?.message ?? "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    dispatch(resetRegistration());
    router.push("/");
  };

  return (
    <CreatePasswordPageComponent
      form={form}
      loading={loading}
      onFinish={onFinish}
      handleCancel={handleCancel}
    />
  );
}
