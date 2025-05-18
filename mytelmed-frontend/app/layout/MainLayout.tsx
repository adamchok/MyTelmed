'use client';

import { Layout } from "antd";
import { Content } from "antd/es/layout/layout";
import { usePathname, useRouter } from "next/navigation";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { MainLayoutProps } from "./props";
import React, { useEffect, useState } from "react";
import Header from "../components/Header/Header";
import i18n from "i18next";
import Sidebar from "../components/Sidebar/Sidebar";
import '../../lib/i18n';
import './index.css';

const MainLayout: React.FC<MainLayoutProps> = ({ children }: MainLayoutProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [dark, setDark] = useState<boolean>(false);
  const [collapsed, setCollapsed] = useState<boolean>(true);
  const path: string = usePathname();
  const router: AppRouterInstance = useRouter();
  const isLandingPage: boolean = path === '/';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedLanguage = localStorage.getItem('language') ?? 'en';
    const savedTheme = localStorage.getItem('theme');
    const loginStatus = localStorage.getItem('isLogin') === 'true';

    i18n.changeLanguage(savedLanguage);
    setDark(savedTheme ? savedTheme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsLoggedIn(loginStatus);
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  useEffect(() => {
    if (isLandingPage && isLoggedIn) {
      router.push('/dashboard');
    }
  }, [isLandingPage, isLoggedIn, router]);

  return (
    <Layout>
      {!isLandingPage &&
        <Header
          isLoggedIn={isLoggedIn}
          setIsLoggedIn={setIsLoggedIn}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          className="sticky top-0 z-10"
        />
      }
      <Layout className={`main-layout ${isLandingPage ? 'landing-page' : ''}`}>
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        <Content className="overflow-y-auto bg-gray-50 px-6 mb-6 md:px-10">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
