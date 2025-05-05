'use client';

import { RootState } from "@/lib/reducers";
import { LogoutOutlined, TranslationOutlined } from "@ant-design/icons";
import { Col, Menu, Row, message } from "antd";
import { Header } from "antd/es/layout/layout";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { menus } from "./menu";
import AuthApi from "../api/auth";
import Image from "next/image";
import LanguageSetting from "./Language";
import './index.css';

const TMHeader = () => {
	const [isLanguageSettingsVisible, setIsLanguageSettingsVisible] = useState(false);
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [isLoggingOut, setIsLoggingOut] = useState(false);
	const { t } = useTranslation('header');
	const router = useRouter();
	const dispatch = useDispatch();
	const isLoginFromStore = useSelector((state: RootState) => state?.rootReducer?.authenticationReducer?.isLogin);

	useEffect(() => {
		setIsLoggedIn(isLoginFromStore);
	}, [isLoginFromStore]);

	const handleLogout = async () => {
		if (isLoggingOut) return;

		setIsLoggingOut(true);

		try {
			dispatch({ type: "SET_LOGIN_STATUS", payload: false });
			await AuthApi.logout();

			message.success(t("logoutSuccessMessage") || "Log out successful");

			if (typeof window !== undefined) {
				localStorage.removeItem("isLogin");
				localStorage.removeItem("accessToken");
				localStorage.removeItem("refreshToken");
				localStorage.removeItem("currentUser");
			}

			setIsLoggedIn(false);
			router.push("/sign-in");
		} catch (error) {
			console.error("Logout error:", error);
			message.error(t("logoutFailedMessage") || "Logout failed, please try again");
		} finally {
			setIsLoggingOut(false);
		}
	};

	return (
		<div>
			<LanguageSetting
				show={isLanguageSettingsVisible}
				setShow={setIsLanguageSettingsVisible}
			/>
			<Header className="header">
				<Row gutter={16} className="w-full text-left">
					<Col lg={4} md={6} sm={8} xs={16}>
						<Image
							src="/logos/logo-dark-long-174.png"
							alt="logo"
							width={174}
							height={64}
							priority
						/>
					</Col>
					<Col lg={18} md={16} sm={14} xs={5} className="text-right">
						{isLoggedIn &&
							<Menu
								mode="horizontal"
								defaultSelectedKeys={["1"]}
								items={menus(t)}
								style={{ flex: 1, minWidth: 0 }}
								className="header-menu"
							/>
						}
					</Col>
					<Col lg={2} md={2} sm={2} xs={3}>
						<div className="flex justify-end">
							<div
								className="cursor-pointer"
								onClick={() => setIsLanguageSettingsVisible(!isLanguageSettingsVisible)}
							>
								<TranslationOutlined className="text-xl hover:text-blue-400" />
							</div>
							&emsp;
							{isLoggedIn &&
								<div
									className="cursor-pointer"
									onClick={handleLogout}
								>
									<LogoutOutlined className="text-xl hover:text-red-400" />
								</div>
							}
						</div>
					</Col>
				</Row>
			</Header>
		</div>
	);
};

export default TMHeader;
