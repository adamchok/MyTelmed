"use client";

import React, { useState, useEffect } from "react";
import {
    Card,
    Tabs,
    Button,
    Typography,
    Row,
    Col,
    Statistic,
    Spin,
    message,
} from "antd";
import {
    UserCheck,
    Send,
    Clock,
    CheckCircle,
    Calendar,
    Plus,
    FileText,
    TrendingUp,
} from "lucide-react";
import ReferralApi from "@/app/api/referral";
import { ReferralStatisticsDto } from "@/app/api/referral/props";
import MyReferralsTab from "./components/MyReferralsTab";
import ReferralsForMeTab from "./components/ReferralsForMeTab";
import CreateReferralModal from "./components/CreateReferralModal";

const { Title } = Typography;

export default function DoctorReferralPage() {
    const [activeTab, setActiveTab] = useState("outgoing");
    const [loading, setLoading] = useState(true);
    const [statistics, setStatistics] = useState<ReferralStatisticsDto | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Load statistics
    const loadStatistics = async () => {
        try {
            const response = await ReferralApi.getReferralStatistics();
            if (response.data.isSuccess && response.data.data) {
                setStatistics(response.data.data);
            }
        } catch {
            console.error("Failed to load statistics");
        }
    };

    const loadData = async () => {
        setLoading(true);
        try {
            await loadStatistics();
        } catch {
            message.error("Failed to load referral data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [refreshTrigger]);

    const handleRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    const handleCreateSuccess = () => {
        setShowCreateModal(false);
        handleRefresh();
        message.success("Referral created successfully");
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <Title level={2} className="text-gray-800 mb-2 mt-0 text-lg sm:text-xl md:text-3xl">
                        Referral Management
                    </Title>
                    <p className="text-gray-600 text-xs sm:text-sm md:text-base">
                        Manage patient referrals and collaborate with other doctors
                    </p>
                </div>
                <Button
                    type="primary"
                    icon={<Plus className="w-4 h-4" />}
                    onClick={() => setShowCreateModal(true)}
                    size="middle"
                    className="bg-green-700 hover:bg-green-800 border-green-700 w-full sm:w-auto"
                >
                    New Referral
                </Button>
            </div>

            {/* Statistics Cards */}
            {statistics && (
                <Row gutter={[16, 16]}>
                    <Col xs={12} sm={6} lg={6}>
                        <Card className="text-center border-l-4 border-l-orange-500">
                            <Statistic
                                title="Pending"
                                value={statistics.pendingCount}
                                prefix={<Clock className="w-4 h-4 text-orange-500" />}
                                valueStyle={{ color: "#f97316", fontSize: "1.5rem" }}
                            />
                        </Card>
                    </Col>
                    <Col xs={12} sm={6} lg={6}>
                        <Card className="text-center border-l-4 border-l-green-500">
                            <Statistic
                                title="Accepted"
                                value={statistics.acceptedCount}
                                prefix={<CheckCircle className="w-4 h-4 text-green-500" />}
                                valueStyle={{ color: "#22c55e", fontSize: "1.5rem" }}
                            />
                        </Card>
                    </Col>
                    <Col xs={12} sm={6} lg={6}>
                        <Card className="text-center border-l-4 border-l-blue-500">
                            <Statistic
                                title="Scheduled"
                                value={statistics.scheduledCount}
                                prefix={<Calendar className="w-4 h-4 text-blue-500" />}
                                valueStyle={{ color: "#3b82f6", fontSize: "1.5rem" }}
                            />
                        </Card>
                    </Col>
                    <Col xs={12} sm={6} lg={6}>
                        <Card className="text-center border-l-4 border-l-gray-500">
                            <Statistic
                                title="Completed"
                                value={statistics.completedCount}
                                prefix={<TrendingUp className="w-4 h-4 text-gray-500" />}
                                valueStyle={{ color: "#6b7280", fontSize: "1.5rem" }}
                            />
                        </Card>
                    </Col>
                </Row>
            )}

            {/* Main Content Tabs */}
            <Card className="shadow-lg border-0">
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    tabBarExtraContent={
                        <Button
                            type="text"
                            icon={<FileText className="w-4 h-4" />}
                            onClick={handleRefresh}
                            className="text-green-700 hover:text-green-800"
                        >
                            Refresh
                        </Button>
                    }
                    items={[
                        {
                            key: "outgoing",
                            label: (
                                <span className="flex items-center gap-2">
                                    <Send className="w-4 h-4" />
                                    <span className="hidden sm:inline">My Referrals</span>
                                    <span className="sm:hidden">Sent</span>
                                </span>
                            ),
                            children: (
                                <MyReferralsTab
                                    refreshTrigger={refreshTrigger}
                                />
                            ),
                        },
                        {
                            key: "incoming",
                            label: (
                                <span className="flex items-center gap-2">
                                    <UserCheck className="w-4 h-4" />
                                    <span className="hidden sm:inline">Referrals for Me</span>
                                    <span className="sm:hidden">Received</span>
                                </span>
                            ),
                            children: (
                                <ReferralsForMeTab
                                    refreshTrigger={refreshTrigger}
                                    onRefresh={handleRefresh}
                                />
                            ),
                        },
                    ]}
                />
            </Card>

            {/* Create Referral Modal */}
            <CreateReferralModal
                visible={showCreateModal}
                onCancel={() => setShowCreateModal(false)}
                onSuccess={handleCreateSuccess}
            />
        </div>
    );
}
