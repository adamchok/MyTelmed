'use client';

import { Button, Layout } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import LanguageSwitcher from "../LanguageSwitcher/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { HeaderProps } from "./props";
import Logout from "../Logout/Logout";

const { Header: AntdHeader } = Layout;

const Header = ({ isLoggedIn, setIsLoggedIn, collapsed, setCollapsed, className = '' }: HeaderProps) => {
  const { t } = useTranslation('header');

  return (
    <AntdHeader className={`flex items-center justify-between px-10 h-14 bg-blue-950 ${className}`}>
      <Button
        onClick={() => setCollapsed(!collapsed)}
        title={t("openSidebarMenu") || "Open sidebar menu"}
        aria-label={t("openSidebarMenu") || "Open sidebar menu"}
        className="bg-transparent border-none text-[20px] text-gray-200 hover:text-sky-300"
        icon={<MenuOutlined />}
      />
      <div className="flex justify-evenly items-center gap-4">
        <LanguageSwitcher />
        {!isLoggedIn && (
          <Logout setIsLoggedIn={setIsLoggedIn} />
        )}
      </div>
    </AntdHeader>
  )
}

export default Header;
