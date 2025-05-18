'use client';

import { RootState } from "@/lib/reducers";
import { Layout, Menu, Drawer } from "antd";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { menuItems } from "./menu";
import { SidebarProps } from "./props";
import Link from "next/link";
import Image from "next/image";
import './index.css';

const { Sider } = Layout;

const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const { t } = useTranslation('sidebar');
	const pathname = usePathname();
	const isLoginFromStore = useSelector((state: RootState) => state?.rootReducer?.authenticationReducer?.isLogin);

	// Determine selected menu key based on current path
	const getSelectedMenuKey = () => {
		// Extract base path for matching
		const basePath = pathname?.split('?')[0];

		// Check for exact matches first
		if (menuItems(t, isLoggedIn).some(item => item.key === basePath)) {
			return [basePath];
		}

		// For browse/doctors with query params or sub-paths
		if (basePath?.startsWith('/browse/doctors')) {
			return ['/browse/doctors'];
		}

		// For browse/facilities with query params or sub-paths
		if (basePath?.startsWith('/browse/facilities')) {
			return ['/browse/facilities'];
		}

		// For forum with sub-paths
		if (basePath?.startsWith('/forum')) {
			return ['/forum'];
		}

		// Default selected key
		return ['/dashboard'];
	};

	useEffect(() => {
		setIsLoggedIn(isLoginFromStore);
	}, [isLoginFromStore]);

	return (
		<Drawer
			placement="left"
			open={!collapsed}
			onClose={() => setCollapsed(true)}
			width={256}
			styles={{ body: { padding: 0 } }}
			closeIcon={null}
		>
			<Sider
				trigger={null}
				collapsible={false}
				collapsed={false}
				width={256}
				className="sidebar"
			>
				<Link href="/">
					<Image src="/logos/logo-transparent-long-174.png" alt="logo" width={250} height={100} />
				</Link>
				<Menu
					theme="dark"
					mode="inline"
					selectedKeys={getSelectedMenuKey()}
					items={menuItems(t, isLoggedIn)}
					className="sidebar-menu"
					onClick={() => setCollapsed(true)}
				/>
			</Sider>
		</Drawer>
	);
};

export default Sidebar;
