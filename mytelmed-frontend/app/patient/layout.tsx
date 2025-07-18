"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Layout, Menu, Avatar, Button, Drawer, Space, Dropdown, message } from "antd";
import {
    Home,
    Calendar,
    FileText,
    Users,
    User,
    Menu as LucideMenu,
    PlusCircle,
    FileCheck,
    LogOut,
    UserCircle,
    Settings,
    MessageCircle,
    Pill,
    CreditCard,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";
import PatientApi from "@/app/api/patient";
import AuthApi from "@/app/api/auth";
import { Patient } from "../api/patient/props";
import { clearProfile } from "@/lib/reducers/profile-reducer";
import "./patient-menu.css";
import { useDispatch, useSelector } from "react-redux";

const { Header, Sider, Content } = Layout;

const navItems = [
    {
        key: "/patient/dashboard",
        icon: <Home className="w-5 h-5" />,
        label: <Link href="/patient/dashboard">Dashboard</Link>,
    },
    {
        key: "/patient/appointment/book",
        icon: <PlusCircle className="w-5 h-5" />,
        label: <Link href="/patient/appointment/book">Book Appointment</Link>,
    },
    {
        key: "/patient/appointment",
        icon: <Calendar className="w-5 h-5" />,
        label: <Link href="/patient/appointment">Appointments</Link>,
    },
    {
        key: "/patient/chat",
        icon: <MessageCircle className="w-5 h-5" />,
        label: <Link href="/patient/chat">Chat</Link>,
    },
    {
        key: "/patient/documents",
        icon: <FileText className="w-5 h-5" />,
        label: <Link href="/patient/documents">Documents</Link>,
    },
    {
        key: "/patient/referrals",
        icon: <FileCheck className="w-5 h-5" />,
        label: <Link href="/patient/referrals">Referrals</Link>,
    },
    {
        key: "/patient/family",
        icon: <Users className="w-5 h-5" />,
        label: <Link href="/patient/family">Family Access</Link>,
    },
    {
        key: "/patient/prescriptions",
        icon: <Pill className="w-5 h-5" />,
        label: <Link href="/patient/prescription">Prescriptions</Link>,
    },
    {
        key: "/patient/billing",
        icon: <CreditCard className="w-5 h-5" />,
        label: <Link href="/patient/billing">Billing</Link>,
    },
];

export default function PatientLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    const screens = useBreakpoint();
    const isMobile = !screens.lg;
    const [collapsed, setCollapsed] = useState(isMobile);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [patient, setPatient] = useState<Patient | null>(null);
    const pathname = usePathname();
    const dispatch = useDispatch();
    const router = useRouter();

    // Get profile data from Redux store
    const profileData = useSelector((state: any) => state.rootReducer.profile);

    useEffect(() => {
        // Fetch patient profile for avatar/name
        PatientApi.getPatientProfile().then((res) => {
            if (res.data?.isSuccess && res.data.data) {
                setPatient(res.data.data);
            }
        });
    }, []);

    // Update collapsed state when screen size changes
    useEffect(() => {
        setCollapsed(isMobile);
    }, [isMobile]);

    const darkBlue = "#1565c0";
    const lightText = "#fff";

    // Handle logout
    const handleLogout = useCallback(async () => {
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

            // Clear Redux state
            dispatch({ type: "SET_LOGIN_STATUS", payload: false });
            dispatch(clearProfile());

            message.success("Logged out successfully");
            router.push("/");
        }
    }, [dispatch, router]);

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

    // Dropdown menu for avatar actions
    const avatarMenu = [
        {
            key: "profile",
            icon: <UserCircle className="w-4 h-4" />,
            label: <Link href="/patient/profile">Profile</Link>,
        },
        {
            key: "account",
            icon: <Settings className="w-4 h-4" />,
            label: <Link href="/patient/account">Account</Link>,
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
                    {profileData?.name || patient?.name || "Patient"}
                </span>
                <span className="text-gray-200 text-xs">{profileData?.email || patient?.email || ""}</span>
            </div>
        ),
        [profileData?.name, profileData?.email, patient?.name, patient?.email]
    );

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
                        body: { padding: 0, background: darkBlue },
                    }}
                    aria-label="Navigation drawer"
                >
                    <div className="flex flex-col h-full">
                        <div className="flex items-center p-4 pl-6 border-b border-blue-900">{userSection()}</div>
                        {menu}
                    </div>
                </Drawer>
            ) : (
                <Sider
                    width={250}
                    style={{
                        background: darkBlue,
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
                        <div className="flex flex-col gap-2 p-4 pl-6 border-b border-blue-900">{userSection()}</div>
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
                                icon={<LucideMenu className="w-6 h-6" color={darkBlue} />}
                                aria-label="Open navigation drawer"
                                onClick={() => setDrawerVisible(true)}
                                style={{ marginRight: 8 }}
                            />
                        )}
                    </div>
                    <Space className="pr-4">
                        <Dropdown menu={{ items: avatarMenu }} trigger={["click"]} placement="bottomRight">
                            <Avatar
                                src={profileData?.profileImageUrl || patient?.profileImageUrl}
                                icon={<User className="w-5 h-5" />}
                                size={36}
                                style={{ backgroundColor: "#1565c0", color: lightText, cursor: "pointer" }}
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
}
