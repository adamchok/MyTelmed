"use client";

import { useState } from "react";
import {
    Typography,
    Button,
    Spin,
    Card,
    Alert,
    Row,
    Col,
    Statistic,
    Tabs,
} from "antd";
import {
    CalendarOutlined,
} from "@ant-design/icons";
import { Clock, CheckCircle, TrendingUp, Send, UserCheck, FileText, Plus } from "lucide-react";
import { ReferralStatisticsDto } from "@/app/api/referral/props";
import MyReferralsTab from "./components/MyReferralsTab";
import ReferralsForMeTab from "./components/ReferralsForMeTab";

const { Title, Text } = Typography;

interface DoctorReferralComponentProps {
    statistics: ReferralStatisticsDto | null;
    onRefresh: () => void;
    onCreateReferral: () => void;
    loading: boolean;
    error?: string | null;
    refreshTrigger: number;
}

const DoctorReferralComponent: React.FC<DoctorReferralComponentProps> = ({
    statistics,
    onRefresh,
    onCreateReferral,
    loading,
    error,
    refreshTrigger,
}) => {
    const [activeTab, setActiveTab] = useState("outgoing");

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-6">
                <div className="flex justify-center items-center min-h-[400px]">
                    <Spin size="large" />
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
                <div>
                    <Title level={2} className="my-0 text-gray-800 text-xl sm:text-2xl lg:text-3xl">
                        Referral Management
                    </Title>
                    <Text className="text-gray-600 text-sm sm:text-base">
                        Manage patient referrals and collaborate with other doctors
                    </Text>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                        type="primary"
                        icon={<Plus className="w-4 h-4" />}
                        onClick={onCreateReferral}
                        size="large"
                        className="bg-green-600 hover:bg-green-700 border-green-600"
                    >
                        New Referral
                    </Button>
                    <Button
                        type="default"
                        icon={<FileText className="w-4 h-4" />}
                        onClick={onRefresh}
                        size="large"
                        className="border-green-600 text-green-600 hover:bg-green-50"
                    >
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <Alert
                    message="Error Loading Referrals"
                    description={error}
                    type="error"
                    showIcon
                    className="mb-6"
                    action={
                        <Button size="small" danger onClick={onRefresh}>
                            Retry
                        </Button>
                    }
                />
            )}

            {/* Statistics Cards */}
            {statistics && (
                <Row gutter={[16, 16]} className="mb-6">
                    <Col xs={24} sm={6}>
                        <Card className="shadow-lg border-0 bg-white">
                            <Statistic
                                title={
                                    <div className="flex items-center">
                                        <Clock className="w-4 h-4 text-orange-500 mr-2" />
                                        <Text className="text-gray-700">Pending</Text>
                                    </div>
                                }
                                value={statistics.pendingCount}
                                valueStyle={{ color: "#f97316", fontSize: "24px", fontWeight: "bold" }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={6}>
                        <Card className="shadow-lg border-0 bg-white">
                            <Statistic
                                title={
                                    <div className="flex items-center">
                                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                        <Text className="text-gray-700">Accepted</Text>
                                    </div>
                                }
                                value={statistics.acceptedCount}
                                valueStyle={{ color: "#22c55e", fontSize: "24px", fontWeight: "bold" }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={6}>
                        <Card className="shadow-lg border-0 bg-white">
                            <Statistic
                                title={
                                    <div className="flex items-center">
                                        <CalendarOutlined className="text-green-600 mr-2" />
                                        <Text className="text-gray-700">Scheduled</Text>
                                    </div>
                                }
                                value={statistics.scheduledCount}
                                valueStyle={{ color: "#22c55e", fontSize: "24px", fontWeight: "bold" }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={6}>
                        <Card className="shadow-lg border-0 bg-white">
                            <Statistic
                                title={
                                    <div className="flex items-center">
                                        <TrendingUp className="w-4 h-4 text-gray-500 mr-2" />
                                        <Text className="text-gray-700">Completed</Text>
                                    </div>
                                }
                                value={statistics.completedCount}
                                valueStyle={{ color: "#6b7280", fontSize: "24px", fontWeight: "bold" }}
                            />
                        </Card>
                    </Col>
                </Row>
            )}

            {/* Main Content Tabs */}
            <Card className="shadow-lg border-0 bg-white">
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
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
                            children: <MyReferralsTab refreshTrigger={refreshTrigger} />,
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
                            children: <ReferralsForMeTab refreshTrigger={refreshTrigger} onRefresh={onRefresh} />,
                        },
                    ]}
                />
            </Card>


        </div>
    );
};

export default DoctorReferralComponent; 