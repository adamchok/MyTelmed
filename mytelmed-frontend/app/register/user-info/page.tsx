"use client";

import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { Form } from "antd";
import { resetRegistration, setUserInfo } from "@/lib/reducers/registration-reducer";
import type { RootState } from "@/lib/reducers";
import { Dispatch } from "react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { UserInfo } from "./props";
import UserInfoPageComponent from "./component";


export default function UserInfoPage() {
  const dispatch: Dispatch<any> = useDispatch();
  const router: AppRouterInstance = useRouter();
  const userInfo: UserInfo = useSelector((state: RootState) => state.rootReducer.registration.userInfo);

  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    dispatch(setUserInfo({
      ...values,
      dob: values.dob.format("YYYY-MM-DD"),
    }));
    router.push("/register/verify-email");
  };

  const handleCancel = () => {
    dispatch(resetRegistration());
    router.push("/");
  };

  return (
    <UserInfoPageComponent
      form={form}
      onFinish={onFinish}
      userInfo={userInfo}
      handleCancel={handleCancel}
    />
  );
}
