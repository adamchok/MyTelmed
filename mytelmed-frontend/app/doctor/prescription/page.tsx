"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
    Pill,
    FileText,
    Clock,
    CheckCircle,
    Plus,
} from "lucide-react";
import PrescriptionApi from "@/app/api/prescription";
import { PrescriptionDto } from "@/app/api/prescription/props";
import MyPrescriptionsTab from "./components/MyPrescriptionsTab";

const { Title } = Typography;

export default function DoctorPrescriptionPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("my-prescriptions");
    const [loading, setLoading] = useState(true);
    const [prescriptions, setPrescriptions] = useState<PrescriptionDto[]>([]);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Statistics
    const [totalPrescriptions, setTotalPrescriptions] = useState(0);
    const [recentPrescriptions, setRecentPrescriptions] = useState(0);
    const [activePrescriptions, setActivePrescriptions] = useState(0);

    // Load prescriptions and calculate statistics
    const loadPrescriptions = async () => {
        try {
            const response = await PrescriptionApi.getPrescriptions();
            if (response.data.isSuccess && response.data.data) {
                const prescriptionList = response.data.data.content || [];
                setPrescriptions(prescriptionList);

                // Calculate statistics
                setTotalPrescriptions(prescriptionList.length);

                // Recent prescriptions (last 7 days)
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                const recent = prescriptionList.filter(p =>
                    new Date(p.createdAt) >= oneWeekAgo
                ).length;
                setRecentPrescriptions(recent);

                // Active prescriptions (not expired, cancelled, or ready)
                const active = prescriptionList.filter(p =>
                    p.status === "CREATED" ||
                    p.status === "READY_FOR_PROCESSING" ||
                    p.status === "PROCESSING"
                ).length;
                setActivePrescriptions(active);
            }
        } catch (error) {
            console.error("Failed to load prescriptions:", error);
            message.error("Failed to load prescriptions");
        }
    };

    const loadData = async () => {
        setLoading(true);
        try {
            await loadPrescriptions();
        } catch {
            message.error("Failed to load prescription data");
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

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="container mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <Title level={2} className="text-gray-800 mb-2 mt-0 text-lg sm:text-xl md:text-3xl">
                        Prescription Management
                    </Title>
                    <p className="text-gray-600 text-xs sm:text-sm md:text-base">
                        Manage prescriptions for your patients
                    </p>
                </div>
                <Button
                    type="primary"
                    icon={<Plus className="w-4 h-4" />}
                    onClick={() => router.push("/doctor/prescription/create")}
                    size="middle"
                    className="bg-green-600 hover:bg-green-700 border-green-600 w-full sm:w-auto"
                    style={{ backgroundColor: "#059669" }}
                >
                    Create Prescription
                </Button>
            </div>

            {/* Statistics Cards */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={8} md={8}>
                    <Card className="h-full">
                        <Statistic
                            title={
                                <span className="flex items-center gap-2 text-xs sm:text-sm">
                                    <Pill className="w-4 h-4 text-blue-600" />
                                    Total Prescriptions
                                </span>
                            }
                            value={totalPrescriptions}
                            valueStyle={{ color: '#1890ff', fontSize: '1.5rem' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8} md={8}>
                    <Card className="h-full">
                        <Statistic
                            title={
                                <span className="flex items-center gap-2 text-xs sm:text-sm">
                                    <Clock className="w-4 h-4 text-orange-600" />
                                    Recent (7 days)
                                </span>
                            }
                            value={recentPrescriptions}
                            valueStyle={{ color: '#fa8c16', fontSize: '1.5rem' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8} md={8}>
                    <Card className="h-full">
                        <Statistic
                            title={
                                <span className="flex items-center gap-2 text-xs sm:text-sm">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                    Active Prescriptions
                                </span>
                            }
                            value={activePrescriptions}
                            valueStyle={{ color: '#52c41a', fontSize: '1.5rem' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Main Content Tabs */}
            <Card>
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={[
                        {
                            key: "my-prescriptions",
                            label: (
                                <span className="flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    <span className="hidden sm:inline">My Prescriptions</span>
                                    <span className="sm:hidden">Prescriptions</span>
                                </span>
                            ),
                            children: (
                                <MyPrescriptionsTab
                                    prescriptions={prescriptions}
                                    refreshTrigger={refreshTrigger}
                                    onRefresh={handleRefresh}
                                />
                            ),
                        },
                    ]}
                />
            </Card>
        </div>
    );
}
