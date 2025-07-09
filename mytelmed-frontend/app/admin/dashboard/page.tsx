"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Statistic, Typography } from 'antd';
import {
    UserOutlined,
    BookOutlined,
    PlayCircleOutlined,
    EyeOutlined,
    ArrowUpOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { DashboardStats } from '@/app/api/statistics/props';
import StatisticsApi from '@/app/api/statistics';

const { Title, Text } = Typography;

const quickActions = [
    {
        title: 'Publish Article',
        description: 'Create new health article',
        icon: <BookOutlined className="text-2xl text-green-500" />,
        href: '/admin/articles',
        action: 'create',
    },
    {
        title: 'Upload Tutorial',
        description: 'Add new educational tutorial',
        icon: <PlayCircleOutlined className="text-2xl text-purple-500" />,
        href: '/admin/tutorials',
        action: 'create',
    },
    {
        title: 'Manage Users',
        description: 'View and manage all accounts',
        icon: <UserOutlined className="text-2xl text-orange-500" />,
        href: '/admin/users',
        action: 'view',
    },
];

const AdminDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
        totalUsers: 0,
        userGrowth: 0,
        totalArticles: 0,
        totalTutorials: 0,
        contentViews: 0,
        contentGrowth: 0,
    });

    const loadDashboardStats = useCallback(async () => {
        setLoading(true);
        const response = await StatisticsApi.getDashboardStats();
        if (response.data.isSuccess && response.data.data) {
            setDashboardStats(response.data.data);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        loadDashboardStats();
    }, [loadDashboardStats]);

    return (
        <div>
            <div className="mb-6">
                <Title level={2} className="mb-2">Admin Dashboard</Title>
                <Text type="secondary">Welcome back! Here&apos;s what&apos;s happening with MyTelmed today.</Text>
            </div>

            {/* Statistics Cards */}
            <Row gutter={[16, 16]} className="mb-6">
                <Col xs={24} sm={12} lg={6}>
                    <Card loading={loading}>
                        <Statistic
                            title="Total Users"
                            value={dashboardStats.totalUsers}
                            prefix={<UserOutlined />}
                            suffix={
                                <div className="flex items-center text-xs">
                                    <ArrowUpOutlined className="text-green-500 mr-1" />
                                    <span className="text-green-500">{dashboardStats.userGrowth}%</span>
                                </div>
                            }
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card loading={loading}>
                        <Statistic
                            title="Published Articles"
                            value={dashboardStats.totalArticles}
                            prefix={<BookOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card loading={loading}>
                        <Statistic
                            title="Tutorials"
                            value={dashboardStats.totalTutorials}
                            prefix={<PlayCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card loading={loading}>
                        <Statistic
                            title="Content Views"
                            value={dashboardStats.contentViews}
                            prefix={<EyeOutlined />}
                            suffix={
                                <div className="flex items-center text-xs">
                                    <ArrowUpOutlined className="text-green-500 mr-1" />
                                    <span className="text-green-500">{dashboardStats.contentGrowth}%</span>
                                </div>
                            }
                        />
                    </Card>
                </Col>
            </Row>

            {/* Quick Actions */}
            <Row gutter={[16, 16]} className="mb-6">
                <Col span={24}>
                    <Card
                        title={<Title level={4} className="mb-0">Quick Actions</Title>}
                        loading={loading}
                    >
                        <Row gutter={[16, 16]}>
                            {quickActions.map((action) => (
                                <Col xs={24} sm={12} md={6} key={action.title}>
                                    <Link href={action.href} className="no-underline">
                                        <Card
                                            hoverable
                                            className="text-center py-4 h-full flex flex-col justify-center"
                                            styles={{ body: { padding: '24px 16px' } }}
                                        >
                                            <div className="mb-3">
                                                {action.icon}
                                            </div>
                                            <Title level={5} className="mb-2">{action.title}</Title>
                                            <Text className="text-sm text-gray-600">{action.description}</Text>
                                        </Card>
                                    </Link>
                                </Col>
                            ))}
                        </Row>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

const AdminDashboardPage = () => {
    return (
        <AdminDashboard />
    );
};

export default AdminDashboardPage;
