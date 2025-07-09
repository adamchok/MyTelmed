"use client";

import { useDispatch, useSelector } from "react-redux";
import { Form, message } from "antd";
import { resetRegistration } from "@/lib/reducers/registration-reducer";
import type { RootState } from "@/lib/reducers";
import { Dispatch, useState } from "react";
import CreatePasswordPageComponent from "./component";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useRouter } from "next/navigation";
import { CreatePatientRequest } from "@/app/api/patient/props";
import PatientApi from "@/app/api/patient";

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
    const registrationRequest: CreatePatientRequest = {
      name: userInfo.name,
      nric: userInfo.nric,
      serialNumber: userInfo.serialNumber,
      email: email,
      phone: userInfo.phone,
      gender: userInfo.gender,
      dateOfBirth: userInfo.dob,
      password: values.password
    }
    try {
      setLoading(true);
      const response = await PatientApi.createPatient(registrationRequest);
      const responseData = response.data;

      if (responseData.isSuccess) {
        message.success(responseData.message);
        dispatch(resetRegistration());
        router.push("/login/patient");
      } else {
        message.error(responseData.message);
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
