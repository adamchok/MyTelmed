"use client";

import { Button, message } from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import AuthApi from "../../api/auth";
import { LogoutProps } from "./props";

const Logout = ({ setIsLoggedIn }: LogoutProps) => {
    const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
    const dispatch = useDispatch();
    const router = useRouter();

    const handleLogout = async () => {
        if (isLoggingOut) return;
        setIsLoggingOut(true);

        try {
            dispatch({ type: "SET_LOGIN_STATUS", payload: false });
            await AuthApi.logout();

            message.success("Log out successful");

            if (typeof window !== "undefined") {
                localStorage.removeItem("isLogin");
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
            }

            setIsLoggedIn(false);
            router.push("/");
        } catch (error) {
            console.error("Logout error:", error);
            message.error("Logout failed, please try again");
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <Button
            onClick={handleLogout}
            disabled={isLoggingOut}
            loading={isLoggingOut}
            className="bg-transparent border-none text-[20px] px-0 text-gray-200 hover:text-sky-500"
            icon={<LogoutOutlined />}
        />
    );
};

export default Logout;
