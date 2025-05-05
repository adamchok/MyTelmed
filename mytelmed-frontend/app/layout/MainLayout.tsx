'use client';

import { Layout } from "antd";
import { Content } from "antd/es/layout/layout";
import { appWithTranslation } from 'next-i18next';
import { AppProps } from "next/app";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect } from "react";
import i18n from "i18next";
import TMHeader from "./Header";
import '../../lib/i18n';

interface MainLayoutProps extends AppProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }: MainLayoutProps) => {
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('language') || 'en';
      i18n.changeLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const accessToken = localStorage.getItem("accessToken");
    const isLogin = localStorage.getItem("isLogin");

    if (path !== '/sign-in' && (!accessToken || !isLogin)) {
      router.push("/sign-in");
      return;
    }

    if (path === '/sign-in' && accessToken && isLogin) {
      router.push("/dashboard");
    }
  }, [path, router]);

  return (
    <Layout>
      <TMHeader />
      <Content style={{
        height: "calc(100vh - 64px)",
        overflow: "auto",
        background: '#E9F0F5'
      }}>
        {children}
      </Content>
    </Layout>
  );
};

export default appWithTranslation(MainLayout);
