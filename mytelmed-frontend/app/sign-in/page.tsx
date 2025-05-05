"use client";

import { message } from "antd";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import AuthApi from "../api/auth";
import Component from "./component";

const SignIn = () => {
	const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
	const { t } = useTranslation("signIn");
	const router = useRouter();
	const dispatch = useDispatch();

	const onFinish = async (values: any) => {
		if (isLoggingIn) return;

		setIsLoggingIn(true);
		const body = {
			username: values.username,
			password: values.password,
		};
		await AuthApi.signIn(body)
			.then(({ data }) => {
				message.success(t("loginSuccessMessage") || "Successfully Sign In");
				localStorage.setItem("accessToken", data?.accessToken);
				localStorage.setItem("refreshToken", data?.refreshToken);
				localStorage.setItem("isLogin", "true");
				localStorage.setItem("currentUser", values.username);
				dispatch({ type: 'SET_LOGIN_STATUS', payload: true });
				router.push('/dashboard');
			})
			.catch((err) => {
				const errorMessage = t("loginFailedMessage") || "Sign-in failed, please try again";
				message.error(errorMessage);
				console.log(err);
			}).finally(() => {
				setIsLoggingIn(false);
			});
	};

	return (
		<div>
			<Component
				onFinish={onFinish}
			/>
		</div>
	);
};

export default SignIn;
