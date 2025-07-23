"use client";

import { useState, useEffect } from "react";
import { Typography, Row, Col, Card, Statistic, Button, List, Tag, Alert, Avatar } from "antd";
import {
    Calendar,
    Clock,
    FileText,
    User,
    Pill,
    Plus,
    ChevronRight,
    AlertCircle,
    Shield,
    Stethoscope,
    Users,
    Send,
    UserCheck
} from "lucide-react";
import Link from "next/link";
import dayjs from "dayjs";
import { parseLocalDateTime } from "@/app/utils/DateUtils";
import AppointmentApi from "@/app/api/appointment";
import ReferralApi from "@/app/api/referral";
import PrescriptionApi from "@/app/api/prescription";
import DoctorApi from "@/app/api/doctor";
import { AppointmentDto } from "@/app/api/appointment/props";
import { ReferralDto, ReferralStatus, ReferralStatisticsDto } from "@/app/api/referral/props";
import { PrescriptionDto } from "@/app/api/prescription/props";
import { Doctor } from "@/app/api/doctor/props";
import { AppointmentStatus } from "@/app/api/props";

const { Title, Text } = Typography;

// Status mapping interfaces
interface StatusMapping {
    label: string;
    color: string;
    description?: string;
}

// Dashboard data interfaces
interface DoctorDashboardData {
    appointments: AppointmentDto[];
    outgoingReferrals: ReferralDto[];
    incomingReferrals: ReferralDto[];
    prescriptions: PrescriptionDto[];
    doctorProfile?: Doctor;
    stats: {
        upcomingAppointments: number;
        pendingReferrals: number;
        activePrescriptions: number;
        totalReferralsSent: number;
    };
    referralStatistics?: ReferralStatisticsDto;
}

// Status mapping functions
const getAppointmentStatusMapping = (status: string): StatusMapping => {
    const mappings: Record<string, StatusMapping> = {
        [AppointmentStatus.PENDING]: {
            label: "Pending Confirmation",
            color: "orange",
            description: "Waiting for confirmation"
        },
        [AppointmentStatus.PENDING_PAYMENT]: {
            label: "Payment Required",
            color: "red",
            description: "Payment required to confirm"
        },
        [AppointmentStatus.CONFIRMED]: {
            label: "Confirmed",
            color: "green",
            description: "Appointment confirmed"
        },
        [AppointmentStatus.READY_FOR_CALL]: {
            label: "Ready for Call",
            color: "blue",
            description: "Ready to join video call"
        },
        [AppointmentStatus.IN_PROGRESS]: {
            label: "In Progress",
            color: "purple",
            description: "Consultation in progress"
        },
        [AppointmentStatus.COMPLETED]: {
            label: "Completed",
            color: "green",
            description: "Consultation completed"
        },
        [AppointmentStatus.CANCELLED]: {
            label: "Cancelled",
            color: "red",
            description: "Appointment cancelled"
        },
        [AppointmentStatus.NO_SHOW]: {
            label: "No Show",
            color: "volcano",
            description: "Patient did not attend"
        }
    };

    return mappings[status] || {
        label: status.charAt(0).toUpperCase() + status.slice(1).toLowerCase(),
        color: "default",
        description: ""
    };
};

const getReferralStatusMapping = (status: ReferralStatus): StatusMapping => {
    const mappings: Record<ReferralStatus, StatusMapping> = {
        [ReferralStatus.PENDING]: {
            label: "Pending Review",
            color: "orange",
            description: "Waiting for doctor review"
        },
        [ReferralStatus.ACCEPTED]: {
            label: "Accepted",
            color: "green",
            description: "Referral accepted by specialist"
        },
        [ReferralStatus.REJECTED]: {
            label: "Rejected",
            color: "red",
            description: "Referral declined by specialist"
        },
        [ReferralStatus.SCHEDULED]: {
            label: "Scheduled",
            color: "blue",
            description: "Appointment scheduled"
        },
        [ReferralStatus.COMPLETED]: {
            label: "Completed",
            color: "green",
            description: "Referral consultation completed"
        },
        [ReferralStatus.EXPIRED]: {
            label: "Expired",
            color: "volcano",
            description: "Referral has expired"
        },
        [ReferralStatus.CANCELLED]: {
            label: "Cancelled",
            color: "red",
            description: "Referral cancelled"
        }
    };

    return mappings[status] || {
        label: status,
        color: "default",
        description: ""
    };
};

const DoctorDashboardComponent = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dashboardData, setDashboardData] = useState<DoctorDashboardData>({
        appointments: [],
        outgoingReferrals: [],
        incomingReferrals: [],
        prescriptions: [],
        stats: {
            upcomingAppointments: 0,
            pendingReferrals: 0,
            activePrescriptions: 0,
            totalReferralsSent: 0,
        },
    });

    // Fetch dashboard data
    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch doctor profile first
            let doctorProfile: Doctor | undefined;
            try {
                const profileResponse = await DoctorApi.getDoctorProfile();
                doctorProfile = profileResponse.data.data;
            } catch (profileError) {
                console.warn("Failed to fetch doctor profile:", profileError);
            }

            // Fetch appointments (upcoming appointments)
            const appointmentsResponse = await AppointmentApi.getAllAppointmentsByAccount();
            const appointments = appointmentsResponse.data.data || [];

            // Filter upcoming appointments (status not cancelled/completed and date in future)
            const upcomingAppointments = appointments.filter((appointment) => {
                const appointmentDate = parseLocalDateTime(appointment.appointmentDateTime);
                const isUpcoming =
                    appointmentDate.isAfter(dayjs()) &&
                    appointment.status !== "CANCELLED" &&
                    appointment.status !== "COMPLETED";
                return isUpcoming;
            });

            // Fetch outgoing referrals (referrals created by this doctor)
            let outgoingReferrals: ReferralDto[] = [];
            try {
                const outgoingResponse = await ReferralApi.getReferralsByReferringDoctor();
                outgoingReferrals = outgoingResponse.data.data?.content || [];
            } catch (referralError) {
                console.warn("Failed to fetch outgoing referrals:", referralError);
            }

            // Fetch incoming referrals (referrals for this doctor)
            let incomingReferrals: ReferralDto[] = [];
            try {
                const incomingResponse = await ReferralApi.getReferralsByReferredDoctor();
                incomingReferrals = incomingResponse.data.data?.content || [];
            } catch (referralError) {
                console.warn("Failed to fetch incoming referrals:", referralError);
            }

            // Fetch prescriptions created by this doctor
            let prescriptions: PrescriptionDto[] = [];
            if (doctorProfile?.id) {
                try {
                    const prescriptionsResponse = await PrescriptionApi.getPrescriptionsByDoctor(doctorProfile.id);
                    prescriptions = prescriptionsResponse.data.data?.content || [];

                    // Filter active prescriptions (not expired or cancelled)
                    prescriptions = prescriptions.filter((prescription) => {
                        const isActive = prescription.status !== "EXPIRED" && prescription.status !== "CANCELLED";
                        return isActive;
                    });
                } catch (prescriptionError) {
                    console.warn("Failed to fetch prescriptions:", prescriptionError);
                }
            }

            // Fetch referral statistics
            let referralStatistics: ReferralStatisticsDto | undefined;
            try {
                const statisticsResponse = await ReferralApi.getReferralStatistics();
                referralStatistics = statisticsResponse.data.data;
            } catch (statisticsError) {
                console.warn("Failed to fetch referral statistics:", statisticsError);
            }

            // Filter pending incoming referrals that need doctor's attention
            const pendingIncomingReferrals = incomingReferrals.filter(
                (referral) => referral.status === ReferralStatus.PENDING
            );

            setDashboardData({
                appointments: upcomingAppointments,
                outgoingReferrals: outgoingReferrals.slice(0, 5), // Show only recent 5
                incomingReferrals: incomingReferrals.slice(0, 5), // Show only recent 5
                prescriptions: prescriptions.slice(0, 5), // Show only recent 5
                doctorProfile,
                referralStatistics,
                stats: {
                    upcomingAppointments: upcomingAppointments.length,
                    pendingReferrals: pendingIncomingReferrals.length,
                    activePrescriptions: prescriptions.length,
                    totalReferralsSent: outgoingReferrals.length,
                },
            });
        } catch (err: any) {
            console.error("Failed to fetch dashboard data:", err);
            setError(err.response?.data?.message || "Failed to load dashboard data. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    // Format date for display
    const formatDate = (dateString: string): string => {
        return dayjs(dateString).format("MMM DD, YYYY");
    };

    // Format time for display
    const formatTime = (dateTimeString: string): string => {
        return dayjs(dateTimeString).format("h:mm A");
    };

    if (error) {
        return (
            <div className="container mx-auto">
                <Alert
                    message="Error Loading Dashboard"
                    description={error}
                    type="error"
                    showIcon
                    action={
                        <Button size="small" onClick={fetchDashboardData}>
                            Retry
                        </Button>
                    }
                    className="mb-6"
                />
            </div>
        );
    }

    return (
        <div className="container mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <Title level={2} className="text-gray-800 mb-2 mt-0 text-xl md:text-3xl">
                        Welcome back, Dr. {dashboardData.doctorProfile?.name || "Doctor"}!
                    </Title>
                    <Text className="text-gray-600 text-sm md:text-base">
                        Here&apos;s your practice overview for today
                    </Text>
                </div>
            </div>

            {/* Quick Stats */}
            <Row gutter={[16, 16]} className="mb-8">
                <Col xs={24} sm={12} md={6}>
                    <Card className="shadow-lg border-0 bg-white" styles={{ body: { padding: "24px" } }}>
                        <Statistic
                            title={
                                <div className="flex items-center">
                                    <Calendar className="w-6 h-6 text-green-500 mr-3" />
                                    <Text className="text-gray-700 text-sm md:text-lg font-bold">
                                        Upcoming Appointments
                                    </Text>
                                </div>
                            }
                            value={dashboardData.stats.upcomingAppointments}
                            valueStyle={{ color: "#52c41a", fontSize: "32px", fontWeight: "bold" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card className="shadow-lg border-0 bg-white" styles={{ body: { padding: "24px" } }}>
                        <Statistic
                            title={
                                <div className="flex items-center">
                                    <AlertCircle className="w-6 h-6 text-orange-500 mr-3" />
                                    <Text className="text-gray-700 text-sm md:text-lg font-bold">Pending Referrals</Text>
                                </div>
                            }
                            value={dashboardData.stats.pendingReferrals}
                            valueStyle={{ color: "#fa8c16", fontSize: "32px", fontWeight: "bold" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card className="shadow-lg border-0 bg-white" styles={{ body: { padding: "24px" } }}>
                        <Statistic
                            title={
                                <div className="flex items-center">
                                    <Pill className="w-6 h-6 text-purple-500 mr-3" />
                                    <Text className="text-gray-700 text-sm md:text-lg font-bold">
                                        Active Prescriptions
                                    </Text>
                                </div>
                            }
                            value={dashboardData.stats.activePrescriptions}
                            valueStyle={{ color: "#722ed1", fontSize: "32px", fontWeight: "bold" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card className="shadow-lg border-0 bg-white" styles={{ body: { padding: "24px" } }}>
                        <Statistic
                            title={
                                <div className="flex items-center">
                                    <Send className="w-6 h-6 text-blue-500 mr-3" />
                                    <Text className="text-gray-700 text-sm md:text-lg font-bold">Total Referrals Sent</Text>
                                </div>
                            }
                            value={dashboardData.stats.totalReferralsSent}
                            valueStyle={{ color: "#1890ff", fontSize: "32px", fontWeight: "bold" }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Quick Actions */}
            <Row gutter={[16, 16]} className="mb-8">
                <Col xs={24}>
                    <Card
                        title={
                            <div className="flex items-center">
                                <Shield className="w-6 h-6 text-green-500 mr-3" />
                                <Title level={4} className="m-0 text-gray-800 text-base md:text-lg">
                                    Quick Actions
                                </Title>
                            </div>
                        }
                        className="shadow-lg border-0 bg-white"
                        styles={{ body: { padding: "24px" } }}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <Link href="/doctor/referral" className="no-underline">
                                <Card
                                    hoverable
                                    className="text-center py-6 h-full justify-center border-2 border-green-200 hover:border-green-500 transition-all duration-200"
                                >
                                    <div className="flex flex-col items-center justify-center">
                                        <FileText className="w-12 h-12 text-green-500 mb-4" />
                                        <Text strong className="text-gray-800 text-sm md:text-lg">
                                            Create Referral
                                        </Text>
                                        <Text className="text-gray-500 text-xs md:text-sm mt-2">
                                            Refer patient to specialist
                                        </Text>
                                    </div>
                                </Card>
                            </Link>
                            <Link href="/doctor/prescription" className="no-underline">
                                <Card
                                    hoverable
                                    className="text-center py-6 h-full flex flex-col justify-center border-2 border-blue-200 hover:border-blue-500 transition-all duration-200"
                                >
                                    <div className="flex flex-col items-center justify-center">
                                        <Pill className="w-12 h-12 text-blue-500 mb-4" />
                                        <Text strong className="text-gray-800 text-sm md:text-lg">
                                            Create Prescription
                                        </Text>
                                        <Text className="text-gray-500 text-xs md:text-sm mt-2">
                                            Prescribe medications
                                        </Text>
                                    </div>
                                </Card>
                            </Link>
                            <Link href="/doctor/appointment" className="no-underline">
                                <Card
                                    hoverable
                                    className="text-center py-6 h-full flex flex-col justify-center border-2 border-purple-200 hover:border-purple-500 transition-all duration-200"
                                >
                                    <div className="flex flex-col items-center justify-center">
                                        <Calendar className="w-12 h-12 text-purple-500 mb-4" />
                                        <Text strong className="text-gray-800 text-sm md:text-lg">
                                            View Schedule
                                        </Text>
                                        <Text className="text-gray-500 text-xs md:text-sm mt-2">
                                            Manage appointments
                                        </Text>
                                    </div>
                                </Card>
                            </Link>
                            <Link href="/doctor/chat" className="no-underline">
                                <Card
                                    hoverable
                                    className="text-center py-6 h-full flex flex-col justify-center border-2 border-orange-200 hover:border-orange-500 transition-all duration-200"
                                >
                                    <div className="flex flex-col items-center justify-center">
                                        <Users className="w-12 h-12 text-orange-500 mb-4" />
                                        <Text strong className="text-gray-800 text-sm md:text-lg">
                                            Patient Chat
                                        </Text>
                                        <Text className="text-gray-500 text-xs md:text-sm mt-2">
                                            Communicate with patients
                                        </Text>
                                    </div>
                                </Card>
                            </Link>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Content Rows */}
            <Row gutter={[16, 16]}>
                {/* Left Column */}
                <Col xs={24} lg={16}>
                    {/* Upcoming Appointments */}
                    <Card
                        title={
                            <div className="flex items-center">
                                <Calendar className="w-6 h-6 text-green-500 mr-3" />
                                <Title level={4} className="m-0 text-gray-800 text-base md:text-lg">
                                    Upcoming Appointments
                                </Title>
                            </div>
                        }
                        extra={
                            <Link href="/doctor/appointment" className="text-green-500 hover:text-green-700">
                                View All <ChevronRight className="w-4 h-4 inline" />
                            </Link>
                        }
                        className="shadow-lg border-0 bg-white mb-6"
                        loading={loading}
                    >
                        {dashboardData.appointments.length > 0 ? (
                            <List
                                itemLayout="horizontal"
                                dataSource={dashboardData.appointments}
                                renderItem={(appointment) => (
                                    <List.Item
                                        actions={[
                                            <Link key="view" href={`/doctor/appointment/${appointment.id}`}>
                                                <Button type="link" className="text-green-500">
                                                    View Details
                                                </Button>
                                            </Link>,
                                        ]}
                                        className="border-b border-gray-100 last:border-b-0"
                                    >
                                        <List.Item.Meta
                                            avatar={
                                                <Avatar
                                                    src={appointment.patient?.profileImageUrl}
                                                    icon={<User className="w-5 h-5" />}
                                                    size={48}
                                                    className="bg-green-100"
                                                />
                                            }
                                            title={
                                                <div className="flex items-center justify-between">
                                                    <Text strong className="text-gray-800 text-sm md:text-base">
                                                        {appointment.patient?.name || "Unknown Patient"}
                                                    </Text>
                                                    <Tag color={getAppointmentStatusMapping(appointment.status).color}>
                                                        {getAppointmentStatusMapping(appointment.status).label}
                                                    </Tag>
                                                </div>
                                            }
                                            description={
                                                <div className="text-gray-600">
                                                    <div className="flex items-center gap-2 text-xs md:text-sm">
                                                        <Clock className="w-4 h-4" />
                                                        <span>
                                                            {formatDate(appointment.appointmentDateTime)} at{" "}
                                                            {formatTime(appointment.appointmentDateTime)}
                                                        </span>
                                                    </div>
                                                    {appointment.consultationMode && (
                                                        <div className="flex items-center gap-2 text-xs md:text-sm mt-1">
                                                            <Stethoscope className="w-4 h-4" />
                                                            <span className="capitalize">
                                                                {appointment.consultationMode.toLowerCase()} Consultation
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            }
                                        />
                                    </List.Item>
                                )}
                            />
                        ) : (
                            <div className="text-center py-8">
                                <Calendar className="w-12 h-12 text-gray-300 mb-4 mx-auto" />
                                <Text className="text-gray-500 block mb-4">No upcoming appointments</Text>
                                <Link href="/doctor/appointment">
                                    <Button type="primary" icon={<Calendar className="w-5 h-5" />} size="large">
                                        View Schedule
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </Card>

                    {/* Recent Referrals (Outgoing) */}
                    <Card
                        title={
                            <div className="flex items-center">
                                <Send className="w-6 h-6 text-blue-500 mr-3" />
                                <Title level={4} className="m-0 text-gray-800 text-base md:text-lg">
                                    Recent Referrals Sent
                                </Title>
                            </div>
                        }
                        extra={
                            <Link href="/doctor/referral" className="text-blue-500 hover:text-blue-700">
                                View All <ChevronRight className="w-4 h-4 inline" />
                            </Link>
                        }
                        className="shadow-lg border-0 bg-white"
                        loading={loading}
                    >
                        {dashboardData.outgoingReferrals.length > 0 ? (
                            <List
                                itemLayout="horizontal"
                                dataSource={dashboardData.outgoingReferrals}
                                renderItem={(referral) => (
                                    <List.Item
                                        actions={[
                                            <Link key="view" href={`/doctor/referral`}>
                                                <Button type="link" className="text-blue-500">
                                                    View Details
                                                </Button>
                                            </Link>
                                        ]}
                                        className="border-b border-gray-100 last:border-b-0"
                                    >
                                        <List.Item.Meta
                                            avatar={
                                                <Avatar
                                                    src={referral.patient?.profileImageUrl}
                                                    icon={<User className="w-5 h-5" />}
                                                    size={48}
                                                    className="bg-blue-100"
                                                />
                                            }
                                            title={
                                                <div className="flex items-center justify-between">
                                                    <Text strong className="text-gray-800 text-sm md:text-base">
                                                        {referral.patient?.name || "Unknown Patient"}
                                                    </Text>
                                                    <Tag color={getReferralStatusMapping(referral.status).color}>
                                                        {getReferralStatusMapping(referral.status).label}
                                                    </Tag>
                                                </div>
                                            }
                                            description={
                                                <div className="text-gray-600">
                                                    <div className="text-xs md:text-sm">
                                                        To: {referral.referredDoctor?.name || referral.externalDoctorName || "External Doctor"}
                                                    </div>
                                                    <div className="text-xs md:text-sm">
                                                        {dayjs(Number(referral.createdAt) * 1000).format("DD/MM/YYYY")}
                                                    </div>
                                                </div>
                                            }
                                        />
                                    </List.Item>
                                )}
                            />
                        ) : (
                            <div className="text-center py-8">
                                <Send className="w-12 h-12 text-gray-300 mb-4 mx-auto" />
                                <Text className="text-gray-500 block mb-4">No referrals sent yet</Text>
                                <Link href="/doctor/referral">
                                    <Button type="primary" icon={<Plus className="w-5 h-5" />} size="large">
                                        Create Referral
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </Card>
                </Col>

                {/* Right Column */}
                <Col xs={24} lg={8}>
                    {/* Pending Referrals (Incoming) */}
                    <Card
                        title={
                            <div className="flex items-center">
                                <UserCheck className="w-6 h-6 text-orange-500 mr-3" />
                                <Title level={4} className="m-0 text-gray-800 text-base md:text-lg">
                                    Pending Referrals for Me
                                </Title>
                            </div>
                        }
                        extra={
                            <Link href="/doctor/referral" className="text-orange-500 hover:text-orange-700">
                                View All <ChevronRight className="w-4 h-4 inline" />
                            </Link>
                        }
                        className="shadow-lg border-0 bg-white mb-6"
                        loading={loading}
                    >
                        {dashboardData.incomingReferrals.filter(r => r.status === ReferralStatus.PENDING).length > 0 ? (
                            <List
                                itemLayout="vertical"
                                size="small"
                                dataSource={dashboardData.incomingReferrals.filter(r => r.status === ReferralStatus.PENDING)}
                                renderItem={(referral) => (
                                    <List.Item
                                        key={referral.id}
                                        actions={[
                                            <Button key="accept" size="small" type="primary">
                                                Accept
                                            </Button>,
                                            <Button key="reject" size="small">
                                                Reject
                                            </Button>,
                                        ]}
                                        className="border-b border-gray-100 last:border-b-0"
                                    >
                                        <List.Item.Meta
                                            title={
                                                <Text strong className="text-gray-800 text-sm">
                                                    {referral.patient?.name || "Unknown Patient"}
                                                </Text>
                                            }
                                            description={
                                                <div className="text-gray-600 text-xs">
                                                    From: Dr. {referral.referringDoctor?.name || "Unknown Doctor"}
                                                    <br />
                                                    {dayjs(Number(referral.createdAt) * 1000).format("DD/MM/YYYY")}
                                                </div>
                                            }
                                        />
                                    </List.Item>
                                )}
                            />
                        ) : (
                            <div className="text-center py-8">
                                <UserCheck className="w-12 h-12 text-gray-300 mb-4 mx-auto" />
                                <Text className="text-gray-500 block">No pending referrals</Text>
                            </div>
                        )}
                    </Card>

                    {/* Recent Prescriptions */}
                    <Card
                        title={
                            <div className="flex items-center">
                                <Pill className="w-6 h-6 text-purple-500 mr-3" />
                                <Title level={4} className="m-0 text-gray-800 text-base md:text-lg">
                                    Recent Prescriptions
                                </Title>
                            </div>
                        }
                        extra={
                            <Link href="/doctor/prescription" className="text-purple-500 hover:text-purple-700">
                                View All <ChevronRight className="w-4 h-4 inline" />
                            </Link>
                        }
                        className="shadow-lg border-0 bg-white"
                        loading={loading}
                    >
                        {dashboardData.prescriptions.length > 0 ? (
                            <List
                                itemLayout="vertical"
                                size="small"
                                dataSource={dashboardData.prescriptions}
                                renderItem={(prescription) => (
                                    <List.Item
                                        key={prescription.id}
                                        className="border-b border-gray-100 last:border-b-0"
                                    >
                                        <List.Item.Meta
                                            title={
                                                <div className="flex items-center justify-between">
                                                    <Text strong className="text-gray-800 text-sm">
                                                        {prescription.appointment?.patient?.name || "Unknown Patient"}
                                                    </Text>
                                                </div>
                                            }
                                            description={
                                                <div className="text-gray-600 text-xs">
                                                    <div>#{prescription.prescriptionNumber}</div>
                                                    <div>{dayjs(Number(prescription.createdAt) * 1000).format("DD/MM/YYYY")}</div>
                                                    {prescription.prescriptionItems && prescription.prescriptionItems.length > 0 && (
                                                        <div className="mt-1">
                                                            {prescription.prescriptionItems.length} item(s)
                                                        </div>
                                                    )}
                                                </div>
                                            }
                                        />
                                    </List.Item>
                                )}
                            />
                        ) : (
                            <div className="text-center py-8">
                                <Pill className="w-12 h-12 text-gray-300 mb-4 mx-auto" />
                                <Text className="text-gray-500 block mb-4">No prescriptions created yet</Text>
                                <Link href="/doctor/prescription">
                                    <Button type="primary" icon={<Plus className="w-5 h-5" />} size="large">
                                        Create Prescription
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default DoctorDashboardComponent;
