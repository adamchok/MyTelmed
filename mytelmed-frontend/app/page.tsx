"use client";

import { useTranslation } from "react-i18next";
import Link from "next/link";
import Image from "next/image";
import LanguageSwitcher from "./components/LanguageSwitcher/LanguageSwitcher";
import { Button } from "antd";
import Title from "antd/es/typography/Title";
import Paragraph from "antd/es/typography/Paragraph";
import { Footer } from "antd/es/layout/layout";

export default function LandingPage() {
  const { t } = useTranslation("landing");

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="max-w-xl w-full bg-white rounded-lg shadow-lg p-8 flex flex-col items-center justify-center mt-16 mb-8 relative">
        <div className="absolute top-4 right-4 z-20">
          <LanguageSwitcher />
        </div>
        <Image
          src="/logos/logo-light-long-174.png"
          alt="App Logo"
          width={174}
          height={64}
        />
        <Title level={1} className="text-center font-bold text-blue-900">{t("welcome")}</Title>
        <Paragraph className="text-gray-700 text-center mb-8">
          {t("description")}
        </Paragraph>
        <div className="flex flex-col md:flex-row gap-4 w-full justify-center">
          <Link href="/login" className="w-full md:w-auto">
            <Button className="w-full md:w-auto px-8 py-3 h-10 bg-blue-700 dark:bg-blue-800 text-white rounded font-bold shadow hover:bg-blue-800 dark:hover:bg-blue-900 transition">
              {t("signIn")}
            </Button>
          </Link>
          <Link href="/knowledge" className="w-full md:w-auto">
            <Button className="w-full md:w-auto px-8 py-3 h-10 border-blue-700 text-blue-700 rounded font-bold shadow hover:bg-blue-50 transition">
              {t("knowledgeHub")}
            </Button>
          </Link>
        </div>
        <div className="mt-4 text-center text-gray-600 text-sm">
          {t("dontHaveAccount", "Don't have an account?")}
          {" "}
          <Link href="/register/user-info" className="text-blue-700 hover:underline font-semibold">
            {t("registerHere", "Register here")}
          </Link>
        </div>
      </div>
      <Footer className="text-gray-700 text-xs text-center bg-transparent">&copy; {new Date().getFullYear()} {t("copyright")}</Footer>
    </div>
  );
}
