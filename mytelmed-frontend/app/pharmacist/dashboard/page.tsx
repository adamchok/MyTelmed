"use client";

import React, { useState, useEffect } from "react";
import {
    Card,
    Row,
    Col,
    Typography,
    Button,
    Space,
    Alert,
    Table,
    Tag,
    Statistic,
    message,
    Spin,
    Empty
} from "antd";
import {
    Activity,
    Clock,
    Package,
    CheckCircle,
    TrendingUp,
    FileText,
    ArrowRight
} from "lucide-react";
import { useRouter } from "next/navigation";
import PrescriptionApi from "@/app/api/prescription";
import PharmacistApi from "@/app/api/pharmacist";
import { PrescriptionDto, PrescriptionStatus } from "@/app/api/prescription/props";
import { DeliveryStatus } from "@/app/api/delivery/props";
import { Pharmacist } from "@/app/api/pharmacist/props";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const { Title, Text } = Typography;

interface DashboardStats {
    totalPrescriptions: number;
    pendingProcessing: number;
    readyForPickup: number;
    completedToday: number;
    totalDeliveries: number;
    outForDelivery: number;
}

export default function PharmacistDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [pharmacist, setPharmacist] = useState<Pharmacist | null>(null);
    const [stats, setStats] = useState<DashboardStats>({
        totalPrescriptions: 0,
        pendingProcessing: 0,
        readyForPickup: 0,
        completedToday: 0,
        totalDeliveries: 0,
        outForDelivery: 0,
    });
    const [recentPrescriptions, setRecentPrescriptions] = useState<PrescriptionDto[]>([]);
    const [urgentPrescriptions, setUrgentPrescriptions] = useState<PrescriptionDto[]>([]);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);

            // First load pharmacist profile to get facility ID
            const pharmacistData = await loadPharmacistProfile();

            if (pharmacistData?.facility?.id) {
                // Then load prescription-related data that depends on facility ID
                await Promise.all([
                    loadPrescriptionStats(pharmacistData.facility.id),
                    loadRecentPrescriptions(pharmacistData.facility.id),
                    loadUrgentPrescriptions(pharmacistData.facility.id)
                ]);
            } else {
                console.warn("No facility ID found for pharmacist");
                message.warning("Unable to load facility data. Please check your profile settings.");
            }
        } catch (error: any) {
            message.error("Failed to load dashboard data");
            console.error("Dashboard loading error:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadPharmacistProfile = async () => {
        try {
            console.log("Loading pharmacist profile...");
            const response = await PharmacistApi.getPharmacistProfile();
            if (response.data.isSuccess && response.data.data) {
                console.log("Pharmacist profile loaded:", response.data.data);
                console.log("Facility ID:", response.data.data.facility?.id);
                setPharmacist(response.data.data);
                return response.data.data;
            } else {
                console.warn("Failed to load pharmacist profile - API response:", response.data);
            }
        } catch (error) {
            console.error("Error loading pharmacist profile:", error);
            message.error("Failed to load pharmacist profile");
        }
        return null;
    };

    const loadPrescriptionStats = async (facilityId: string) => {
        try {
            console.log("Loading prescription stats for facility:", facilityId);
            // Load prescriptions for the facility
            const response = await PrescriptionApi.getPrescriptionsByFacility(facilityId, {
                page: 0,
                size: 100 // Get more for statistics
            });

            if (response.data.isSuccess && response.data.data) {
                const prescriptions = response.data.data.content;
                console.log("Loaded prescriptions:", prescriptions.length, prescriptions);
                // Use server timezone (Asia/Kuala_Lumpur) for date comparison
                const today = dayjs().tz('Asia/Kuala_Lumpur').startOf('day');
                console.log("Today in KL timezone:", today.format());

                const newStats: DashboardStats = {
                    totalPrescriptions: prescriptions.length,
                    pendingProcessing: prescriptions.filter(p =>
                        p.status === PrescriptionStatus.READY_FOR_PROCESSING
                    ).length,
                    readyForPickup: prescriptions.filter(p =>
                        p.delivery?.status === DeliveryStatus.READY_FOR_PICKUP
                    ).length,
                    completedToday: prescriptions.filter(p => {
                        if (p.status !== PrescriptionStatus.READY) return false;
                        // Convert prescription update time to KL timezone for comparison
                        const updatedInKL = dayjs(Number(p.updatedAt) * 1000).tz('Asia/Kuala_Lumpur');
                        const isSameDay = updatedInKL.isSame(today, 'day');
                        console.log(`Prescription ${p.id}: updated ${updatedInKL.format()}, same day: ${isSameDay}`);
                        return isSameDay;
                    }).length,
                    totalDeliveries: prescriptions.filter(p => p.delivery).length,
                    outForDelivery: prescriptions.filter(p =>
                        p.delivery?.status === DeliveryStatus.OUT_FOR_DELIVERY
                    ).length,
                };

                console.log("Calculated stats:", newStats);
                setStats(newStats);
            } else {
                console.warn("Failed to load prescriptions - API response:", response.data);
            }
        } catch (error) {
            console.error("Error loading prescription stats:", error);
            message.error("Failed to load prescription statistics");
        }
    };

    const loadRecentPrescriptions = async (facilityId: string) => {
        try {
            console.log("Loading recent prescriptions for facility:", facilityId);
            const response = await PrescriptionApi.getPrescriptionsByFacility(facilityId, {
                page: 0,
                size: 5,
                sortBy: "updatedAt",
                sortDirection: "desc"
            });

            if (response.data.isSuccess && response.data.data) {
                console.log("Loaded recent prescriptions:", response.data.data.content);
                setRecentPrescriptions(response.data.data.content);
            } else {
                console.warn("Failed to load recent prescriptions - API response:", response.data);
            }
        } catch (error) {
            console.error("Error loading recent prescriptions:", error);
            message.error("Failed to load recent prescriptions");
        }
    };

    const loadUrgentPrescriptions = async (facilityId: string) => {
        try {
            console.log("Loading urgent prescriptions for facility:", facilityId);
            const response = await PrescriptionApi.getPrescriptionsByFacility(facilityId, {
                page: 0,
                size: 10,
                status: PrescriptionStatus.READY_FOR_PROCESSING
            });

            if (response.data.isSuccess && response.data.data) {
                // Filter for urgent prescriptions (older than 2 hours)
                // Use KL timezone for consistent time comparison
                const nowInKL = dayjs().tz('Asia/Kuala_Lumpur');
                const urgent = response.data.data.content.filter(p => {
                    const createdInKL = dayjs(Number(p.createdAt) * 1000).tz('Asia/Kuala_Lumpur');
                    const hoursDiff = nowInKL.diff(createdInKL, 'hours');
                    return hoursDiff > 2;
                });
                console.log("Loaded urgent prescriptions:", urgent.length, urgent);
                setUrgentPrescriptions(urgent);
            } else {
                console.warn("Failed to load urgent prescriptions - API response:", response.data);
            }
        } catch (error) {
            console.error("Error loading urgent prescriptions:", error);
            message.error("Failed to load urgent prescriptions");
        }
    };

    const getStatusColor = (status: PrescriptionStatus) => {
        switch (status) {
            case PrescriptionStatus.CREATED:
                return "blue";
            case PrescriptionStatus.READY_FOR_PROCESSING:
                return "orange";
            case PrescriptionStatus.PROCESSING:
                return "purple";
            case PrescriptionStatus.READY:
                return "green";
            case PrescriptionStatus.EXPIRED:
                return "red";
            case PrescriptionStatus.CANCELLED:
                return "red";
            default:
                return "default";
        }
    };

    const getDeliveryStatusColor = (status: DeliveryStatus) => {
        switch (status) {
            case DeliveryStatus.PENDING_PAYMENT:
                return "orange";
            case DeliveryStatus.PAID:
                return "blue";
            case DeliveryStatus.PREPARING:
                return "purple";
            case DeliveryStatus.READY_FOR_PICKUP:
                return "green";
            case DeliveryStatus.OUT_FOR_DELIVERY:
                return "cyan";
            case DeliveryStatus.DELIVERED:
                return "green";
            case DeliveryStatus.CANCELLED:
                return "red";
            default:
                return "default";
        }
    };

    const recentPrescriptionsColumns = [
        {
            title: 'Prescription',
            dataIndex: 'prescriptionNumber',
            key: 'prescriptionNumber',
            render: (text: string, record: PrescriptionDto) => (
                <div>
                    <Text strong>{text}</Text>
                    <br />
                    <Text type="secondary" className="text-xs">
                        {record.appointment.patient.name}
                    </Text>
                </div>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: PrescriptionStatus) => (
                <Tag color={getStatusColor(status)}>
                    {status.replace(/_/g, ' ')}
                </Tag>
            ),
        },
        {
            title: 'Delivery',
            key: 'delivery',
            render: (record: PrescriptionDto) => (
                record.delivery ? (
                    <Tag color={getDeliveryStatusColor(record.delivery.status)}>
                        {record.delivery.status.replace(/_/g, ' ')}
                    </Tag>
                ) : (
                    <Text type="secondary">No delivery</Text>
                )
            ),
        },
        {
            title: 'Updated',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            render: (date: string) => (
                <Text className="text-xs">
                    {dayjs(Number(date) * 1000).tz('Asia/Kuala_Lumpur').format('MMM DD, HH:mm')}
                </Text>
            ),
        },
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="container mx-auto">
            {/* Header */}
            <div className="mb-6">
                <Title level={2} className="mb-2 mt-0">
                    <Activity className="inline mr-3 text-purple-600" />
                    Pharmacist Dashboard
                </Title>
                <Text className="text-gray-600">
                    Welcome back, {pharmacist?.name}! Here&apos;s your facility overview.
                </Text>
            </div>

            {/* Urgent Alerts */}
            {urgentPrescriptions.length > 0 && (
                <Alert
                    message={`${urgentPrescriptions.length} prescriptions need urgent attention`}
                    description="Some prescriptions have been waiting for processing for more than 2 hours."
                    type="warning"
                    showIcon
                    className="mb-6"
                    action={
                        <Button
                            size="small"
                            type="primary"
                            danger
                            onClick={() => router.push('/pharmacist/prescription')}
                        >
                            View All
                        </Button>
                    }
                />
            )}

            {/* Statistics Cards */}
            <Row gutter={[24, 24]} className="mb-6">
                <Col xs={24} sm={12} lg={6}>
                    <Card className="shadow-lg border-0">
                        <Statistic
                            title="Total Prescriptions"
                            value={stats.totalPrescriptions}
                            prefix={<FileText className="text-blue-500" />}
                            valueStyle={{ color: '#1890ff', fontSize: '24px', fontWeight: 'bold' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="shadow-lg border-0">
                        <Statistic
                            title="Pending Processing"
                            value={stats.pendingProcessing}
                            prefix={<Clock className="text-orange-500" />}
                            valueStyle={{ color: '#fa8c16', fontSize: '24px', fontWeight: 'bold' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="shadow-lg border-0">
                        <Statistic
                            title="Ready for Pickup"
                            value={stats.readyForPickup}
                            prefix={<Package className="text-green-500" />}
                            valueStyle={{ color: '#52c41a', fontSize: '24px', fontWeight: 'bold' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="shadow-lg border-0">
                        <Statistic
                            title="Completed Today"
                            value={stats.completedToday}
                            prefix={<CheckCircle className="text-emerald-500" />}
                            valueStyle={{ color: '#10b981', fontSize: '24px', fontWeight: 'bold' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[24, 24]}>
                {/* Quick Actions */}
                <Col xs={24} lg={8}>
                    <Card
                        title={
                            <span className="flex items-center">
                                <TrendingUp className="mr-2 text-purple-600" />
                                Quick Actions
                            </span>
                        }
                        className="shadow-lg h-full"
                    >
                        <Space direction="vertical" className="w-full" size="middle">
                            <Button
                                type="primary"
                                block
                                icon={<Clock />}
                                onClick={() => router.push('/pharmacist/prescription?status=READY_FOR_PROCESSING')}
                                className="bg-orange-500 hover:bg-orange-600 border-orange-500"
                            >
                                Process Pending ({stats.pendingProcessing})
                            </Button>
                            <Button
                                block
                                icon={<Package />}
                                onClick={() => router.push('/pharmacist/prescription?status=READY')}
                            >
                                Manage Deliveries ({stats.totalDeliveries})
                            </Button>
                            <Button
                                block
                                icon={<FileText />}
                                onClick={() => router.push('/pharmacist/prescription')}
                            >
                                View All Prescriptions
                            </Button>
                        </Space>
                    </Card>
                </Col>

                {/* Recent Activities */}
                <Col xs={24} lg={16}>
                    <Card
                        title={
                            <div className="flex items-center justify-between">
                                <span className="flex items-center">
                                    <Activity className="mr-2 text-purple-600" />
                                    Recent Activities
                                </span>
                                <Button
                                    type="link"
                                    icon={<ArrowRight className="w-4 h-4" />}
                                    onClick={() => router.push('/pharmacist/prescription')}
                                >
                                    View All
                                </Button>
                            </div>
                        }
                        className="shadow-lg h-full"
                    >
                        {recentPrescriptions.length > 0 ? (
                            <Table
                                dataSource={recentPrescriptions}
                                columns={recentPrescriptionsColumns}
                                pagination={false}
                                size="small"
                                rowKey="id"
                                onRow={() => ({
                                    onClick: () => router.push(`/pharmacist/prescription`),
                                    className: 'cursor-pointer hover:bg-gray-50'
                                })}
                            />
                        ) : (
                            <Empty
                                description="No recent activities"
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                            />
                        )}
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
