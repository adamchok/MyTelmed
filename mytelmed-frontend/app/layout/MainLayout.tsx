"use client";

import { Layout } from "antd";
import { Content } from "antd/es/layout/layout";
import { usePathname, useRouter } from "next/navigation";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { MainLayoutProps } from "./props";
import React, { useEffect, useState } from "react";
import "./index.css";
import PWAInstallPrompt from "../components/PWAInstallPrompt";
import NetworkStatus from "../components/NetworkStatus";
import UpdateNotification from "../components/UpdateNotification";
import NotificationSettings from "../components/NotificationSettings";
const MainLayout: React.FC<MainLayoutProps> = ({
  children,
}: MainLayoutProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const path: string = usePathname();
  const router: AppRouterInstance = useRouter();
  const isLandingPage: boolean = path === "/";

  useEffect(() => {
    if (typeof window === "undefined") return;
    const loginStatus = localStorage.getItem("isLogin") === "true";
    setIsLoggedIn(loginStatus);
  }, []);

  useEffect(() => {
    if (isLandingPage && isLoggedIn) {
      router.push("/dashboard");
    }
  }, [isLandingPage, isLoggedIn, router]);

  return (
    <Layout>
      {/* PWA Components */}
      <NetworkStatus />
      <UpdateNotification />
      <NotificationSettings />

      <Content
        className={`${isLandingPage ? "p-0" : "bg-gray-50 px-6 py-6 md:px-10"}`}
      >
        {children}
      </Content>

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </Layout>
  );
};

export default MainLayout;
