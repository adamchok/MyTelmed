"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Layout, Menu, Avatar, Dropdown, Space, Button, message, Drawer } from "antd";
import {
    Home,
    Users,
    User,
    Menu as LucideMenu,
    LogOut,
    UserCircle,
    Settings,
    PlayCircle,
    Book,
    Building,
} from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { Admin } from "../api/admin/props";
import AdminApi from "../api/admin";
import AuthApi from "../api/auth";
import { clearProfile } from "@/lib/reducers/profile-reducer";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";
import "./admin-menu.css"

const { Header, Sider, Content } = Layout;

interface AdminLayoutProps {
    children: React.ReactNode;
}

const navItems = [
    {
        key: "/admin/dashboard",
        icon: <Home />,
        label: <Link href="/admin/dashboard">Dashboard</Link>,
    },
    {
        key: "/admin/users",
        icon: <Users />,
        label: <Link href="/admin/users">User Management</Link>,
    },
    {
        key: "/admin/facilities",
        icon: <Building />,
        label: <Link href="/admin/facilities">Facilities</Link>,
    },
    {
        key: "/admin/articles",
        icon: <Book />,
        label: <Link href="/admin/articles">Articles</Link>,
    },
    {
        key: "/admin/tutorials",
        icon: <PlayCircle />,
        label: <Link href="/admin/tutorials">Tutorials</Link>,
    },
];

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const [admin, setAdmin] = useState<Admin | null>(null);
    const router = useRouter();
    const pathname = usePathname();
    const dispatch = useDispatch();
    const [drawerVisible, setDrawerVisible] = useState(false);
    const screens = useBreakpoint();
    const isMobile = !screens.lg;

    const loadAdminProfile = useCallback(async () => {
        const response = await AdminApi.getProfile();
        if (response.data.isSuccess && response.data.data) {
            setAdmin(response.data.data);
        }
    }, []);

    // Get profile data from Redux store
    const profileData = useSelector((state: any) => state.rootReducer.profile);

    // Handle logout
    const handleLogout = async () => {
        try {
            // Call the logout API
            await AuthApi.logout();
        } catch (error) {
            console.error("Logout API call failed:", error);
            // Continue with logout even if API call fails
        } finally {
            // Clear all authentication data from localStorage
            localStorage.removeItem("isLogin");
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("userType");

            dispatch({ type: "SET_LOGIN_STATUS", payload: false });
            dispatch(clearProfile());

            message.success("Logged out successfully");
            router.push("/");
        }
    };

    useEffect(() => {
        loadAdminProfile();
    }, [loadAdminProfile]);

    // Dropdown menu for avatar actions
    const avatarMenu = [
        {
            key: "profile",
            icon: <UserCircle className="w-4 h-4" />,
            label: <Link href="/admin/profile">Profile</Link>,
        },
        {
            key: "account",
            icon: <Settings className="w-4 h-4" />,
            label: <Link href="/admin/account">Account</Link>,
        },
        {
            key: "logout",
            icon: <LogOut className="w-4 h-4" />,
            label: "Logout",
            onClick: handleLogout,
        },
    ];

    const userSection = useCallback(
        () => (
            <div className="flex flex-col">
                <span className="font-semibold text-white text-base">
                    {profileData?.name || admin?.name || "Patient"}
                </span>
                <span className="text-gray-200 text-xs">{profileData?.email || admin?.email || ""}</span>
            </div>
        ),
        [profileData?.name, profileData?.email, admin?.name, admin?.email]
    );

    const menu = (
        <Menu
            mode="inline"
            selectedKeys={[pathname]}
            items={navItems.map((item) => ({
                ...item,
                label: <span>{item.label}</span>,
                icon: React.cloneElement(item.icon),
                onClick: isMobile ? () => setDrawerVisible(false) : undefined,
            }))}
            style={{ border: "none", background: "transparent" }}
            className="custom-patient-menu"
        />
    );

    const orange = "#c2410c";
    const lightText = "#fff";

    return (
        <Layout style={{ minHeight: "100vh", background: "#e6efff" }}>
            {/* Sidebar for desktop, Drawer for mobile/tablet */}
            {isMobile ? (
                <Drawer
                    open={drawerVisible}
                    onClose={() => setDrawerVisible(false)}
                    placement="left"
                    width={240}
                    maskClosable={true}
                    closable={false}
                    styles={{
                        body: { padding: 0, background: orange },
                    }}
                    aria-label="Navigation drawer"
                >
                    <div className="flex flex-col h-full">
                        <div className="flex items-center p-4 pl-6 border-b border-orange-900">{userSection()}</div>
                        {menu}
                    </div>
                </Drawer>
            ) : (
                <Sider
                    width={250}
                    style={{
                        background: orange,
                        position: "fixed",
                        top: 0,
                        left: 0,
                        height: "100vh",
                        zIndex: 100,
                        transition: "width 0.2s",
                        display: "flex",
                        flexDirection: "column",
                        padding: 0,
                    }}
                    collapsible
                    collapsed={collapsed}
                    onCollapse={setCollapsed}
                    trigger={null}
                    breakpoint="lg"
                    aria-label="Sidebar navigation"
                >
                    {/* Nav */}
                    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                        <div className="flex flex-col gap-2 p-4 pl-6 border-b border-orange-900">{userSection()}</div>
                        {menu}
                    </div>
                </Sider>
            )}
            <Layout
                style={
                    isMobile
                        ? {}
                        : { marginLeft: collapsed ? 80 : 250, transition: "margin-left 0.2s", background: "#e6efff" }
                }
            >
                {/* Header (always sticky, white, shadow) */}
                <Header
                    style={{
                        background: "#fff",
                        borderBottom: "1px solid #e6efff",
                        padding: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        height: 64,
                        position: "sticky",
                        top: 0,
                        zIndex: 101,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    }}
                >
                    <div className="flex items-center gap-2 px-4">
                        {isMobile && (
                            <Button
                                type="text"
                                icon={<LucideMenu className="w-6 h-6" color={orange} />}
                                aria-label="Open navigation drawer"
                                onClick={() => setDrawerVisible(true)}
                                style={{ marginRight: 8 }}
                            />
                        )}
                    </div>
                    <Space className="pr-4">
                        <Dropdown menu={{ items: avatarMenu }} trigger={["click"]} placement="bottomRight">
                            <Avatar
                                src={profileData?.profileImageUrl || admin?.profileImageUrl}
                                icon={<User className="w-5 h-5" />}
                                size={36}
                                style={{ backgroundColor: "#c2410c", color: lightText, cursor: "pointer" }}
                                alt="User avatar"
                            />
                        </Dropdown>
                    </Space>
                </Header>
                {/* Main content area as a card */}
                <Content className="p-8 bg-white overflow-y-auto">{children}</Content>
            </Layout>
        </Layout>
    );
};

export default AdminLayout;
