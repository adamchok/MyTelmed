"use client";

import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { Form, message } from "antd";
import { resetRegistration, setEmail } from "@/lib/reducers/registration-reducer";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import type { RootState } from "@/lib/reducers";
import { useState, useEffect, Dispatch } from "react";
import VerifyEmailPageComponent from "./component";
import VerificationApi from "@/app/api/verification";
import { SendVerificationEmailRequestDto } from "@/app/api/verification/props";

export default function VerifyEmailPage() {
	const dispatch: Dispatch<any> = useDispatch();
	const router: AppRouterInstance = useRouter();
	const emailFromStore: string = useSelector((state: RootState) => state.rootReducer.registration.email);

	const [form] = Form.useForm();
	const [resendCooldown, setResendCooldown] = useState<number>(0);
	const [loading, setLoading] = useState<boolean>(false);

	useEffect(() => {
		let timer: NodeJS.Timeout;
		if (resendCooldown > 0) {
			timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
		}
		return () => clearTimeout(timer);
	}, [resendCooldown]);

	const handleSendCode = async () => {
		const email = form.getFieldValue("email");
		if (!email) {
			message.error("Please enter your email first.");
			return;
		}
		const emailVerificationRequest: SendVerificationEmailRequestDto = { email };
		try {
			setLoading(true);
			const response = await VerificationApi.sendVerificationEmail(emailVerificationRequest);

			const responseData = response.data;

			if (responseData.isSuccess) {
				message.success(responseData.message);
			} else {
				message.error(responseData.message);
			}
		} catch (err: any) {
			message.error(err?.response?.data?.message ?? "Failed to send verification code.");
		} finally {
			setLoading(false);
			setResendCooldown(30);
		}
	};

	const onFinish = async (values: any) => {
		if (!values.email || !values.code) {
			message.error("Please enter your email and code first.");
			return;
		}

		setLoading(true);
		try {
			const response = await VerificationApi.verifyEmail(values.code);
			const responseData = response.data;

			if (responseData.isSuccess) {
				dispatch(setEmail(values.email));
				message.success(responseData.message);
				router.push("/patient/register/create-password");
			} else {
				message.error(responseData.message);
			}
		} catch (err: any) {
			message.error(err?.response?.data?.message ?? "Invalid verification code.");
		} finally {
			setLoading(false);
		}
	};

	const handleCancel = () => {
		dispatch(resetRegistration());
		router.push("/");
	};

	return (
		<VerifyEmailPageComponent
			form={form}
			onFinish={onFinish}
			handleCancel={handleCancel}
			email={emailFromStore}
			loading={loading}
			resendCooldown={resendCooldown}
			handleSendCode={handleSendCode}
		/>
	);
}
