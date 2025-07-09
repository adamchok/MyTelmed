"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Menu, Typography, Avatar, Dropdown, Space, Button, theme, MenuProps } from 'antd';
import {
    DashboardOutlined,
    UserOutlined,
    BookOutlined,
    PlayCircleOutlined,
    SettingOutlined,
    LogoutOutlined,
    MenuOutlined,
    BellOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { Admin } from '../api/admin/props';
import AdminApi from '../api/admin';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

interface AdminLayoutProps {
    children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const [adminProfile, setAdminProfile] = useState<Admin | null>(null);
    const router = useRouter();
    const pathname = usePathname();
    const dispatch = useDispatch();
    const { token } = theme.useToken();

    const loadAdminProfile = useCallback(async () => {
        const response = await AdminApi.getProfile();
        if (response.data.isSuccess && response.data.data) {
            setAdminProfile(response.data.data);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('isLogin');
        localStorage.removeItem('userType');
        dispatch({ type: 'SET_LOGIN_STATUS', payload: false });
        router.push('/');
    };

    useEffect(() => {
        loadAdminProfile();
    }, [loadAdminProfile]);

    const menuItems = [
        {
            key: '/admin/dashboard',
            icon: <DashboardOutlined />,
            label: <Link href="/admin/dashboard">Dashboard</Link>,
        },
        {
            key: '/admin/users',
            icon: <UserOutlined />,
            label: <Link href="/admin/users">User Management</Link>,
        },
        {
            key: '/admin/articles',
            icon: <BookOutlined />,
            label: <Link href="/admin/articles">Articles</Link>,
        },
        {
            key: '/admin/tutorials',
            icon: <PlayCircleOutlined />,
            label: <Link href="/admin/tutorials">Tutorials</Link>,
        },
        {
            key: '/admin/profile',
            icon: <SettingOutlined />,
            label: <Link href="/admin/profile">Profile Settings</Link>,
        },
    ];

    const userMenuItems: MenuProps['items'] = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: 'Profile Settings',
            onClick: () => router.push('/admin/profile'),
        },
        {
            type: 'divider' as const,
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Logout',
            onClick: handleLogout,
        },
    ];

    const selectedKey = pathname;

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                width={250}
                style={{
                    background: token.colorBgContainer,
                    borderRight: `1px solid ${token.colorBorderSecondary}`,
                }}
            >
                <div className="flex items-center justify-center p-4 border-b border-gray-200">
                    {!collapsed ? (
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                                <SettingOutlined className="text-white text-lg" />
                            </div>
                            <div>
                                <Title level={4} className="mb-0 text-red-600">MyTelmed</Title>
                                <Text className="text-xs text-gray-500">Admin Portal</Text>
                            </div>
                        </div>
                    ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                            <SettingOutlined className="text-white text-lg" />
                        </div>
                    )}
                </div>

                <Menu
                    theme="light"
                    mode="inline"
                    selectedKeys={[selectedKey]}
                    items={menuItems}
                    style={{ border: 'none' }}
                    className="mt-4"
                />
            </Sider>

            <Layout>
                <Header
                    style={{
                        padding: '0 24px',
                        background: token.colorBgContainer,
                        borderBottom: `1px solid ${token.colorBorderSecondary}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <div className="flex items-center">
                        <Button
                            type="text"
                            icon={<MenuOutlined />}
                            onClick={() => setCollapsed(!collapsed)}
                            style={{
                                fontSize: '16px',
                                width: 40,
                                height: 40,
                            }}
                        />
                    </div>

                    <Space size="middle">
                        <Button
                            type="text"
                            icon={<BellOutlined />}
                            size="large"
                            className="flex items-center justify-center"
                        />

                        <Dropdown
                            menu={{ items: userMenuItems }}
                            placement="bottomRight"
                            trigger={['click']}
                        >
                            <div className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                                <Avatar
                                    icon={<UserOutlined />}
                                    src={adminProfile?.profileImageUrl}
                                    size="large"
                                />
                                <div className="text-left">
                                    <Text strong className="block">{adminProfile?.name || 'Admin'}</Text>
                                    <Text className="text-xs text-gray-500">{adminProfile?.email || 'admin@mytelmed.live'}</Text>
                                </div>
                            </div>
                        </Dropdown>
                    </Space>
                </Header>

                <Content
                    style={{
                        margin: '24px',
                        padding: '24px',
                        background: token.colorBgContainer,
                        borderRadius: token.borderRadiusLG,
                        minHeight: 'calc(100vh - 112px)',
                    }}
                >
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
};

export default AdminLayout;
