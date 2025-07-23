"use client";

import { useState, useEffect } from "react";
import { Typography, Row, Col, Card, Statistic, Button, List, Tag, Empty, Alert, Avatar } from "antd";
import { Calendar, Clock, FileText, User, Pill, Plus, ChevronRight, AlertCircle, Shield } from "lucide-react";
import Link from "next/link";
import dayjs from "dayjs";
import { parseLocalDateTime } from "@/app/utils/DateUtils";
import AppointmentApi from "@/app/api/appointment";
import ReferralApi from "@/app/api/referral";
import PrescriptionApi from "@/app/api/prescription";
import PatientApi from "@/app/api/patient";
import { AppointmentDto } from "@/app/api/appointment/props";
import { ReferralDto, ReferralStatus } from "@/app/api/referral/props";
import { PrescriptionDto, PrescriptionStatus } from "@/app/api/prescription/props";
import { Patient } from "@/app/api/patient/props";
import { AppointmentStatus } from "@/app/api/props";

const { Title, Text } = Typography;

// Status mapping interfaces
interface StatusMapping {
    label: string;
    color: string;
    description?: string;
}

// Dashboard data interfaces
interface DashboardData {
    appointments: AppointmentDto[];
    referrals: ReferralDto[];
    prescriptions: PrescriptionDto[];
    patientProfile?: Patient;
    stats: {
        upcomingAppointments: number;
        activeReferrals: number;
        activePrescriptions: number;
    };
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

const getPrescriptionStatusMapping = (status: string): StatusMapping => {
    const mappings: Record<string, StatusMapping> = {
        [PrescriptionStatus.CREATED]: {
            label: "Issued",
            color: "blue",
            description: "Prescription created by doctor"
        },
        [PrescriptionStatus.READY_FOR_PROCESSING]: {
            label: "Ready for Processing",
            color: "orange",
            description: "Ready for pharmacy processing"
        },
        [PrescriptionStatus.PROCESSING]: {
            label: "Processing",
            color: "purple",
            description: "Being prepared by pharmacist"
        },
        [PrescriptionStatus.READY]: {
            label: "Ready",
            color: "green",
            description: "Medication ready for pickup/delivery"
        },
        [PrescriptionStatus.EXPIRED]: {
            label: "Expired",
            color: "volcano",
            description: "Prescription has expired"
        },
        [PrescriptionStatus.CANCELLED]: {
            label: "Cancelled",
            color: "red",
            description: "Prescription cancelled"
        }
    };

    return mappings[status] || {
        label: status.charAt(0).toUpperCase() + status.slice(1).toLowerCase(),
        color: "default",
        description: ""
    };
};

const Component = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dashboardData, setDashboardData] = useState<DashboardData>({
        appointments: [],
        referrals: [],
        prescriptions: [],
        stats: {
            upcomingAppointments: 0,
            activeReferrals: 0,
            activePrescriptions: 0,
        },
    });

    // Fetch dashboard data
    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch patient profile first
            let patientProfile: Patient | undefined;
            try {
                const profileResponse = await PatientApi.getPatientProfile();
                patientProfile = profileResponse.data.data;
            } catch (profileError) {
                console.warn("Failed to fetch patient profile:", profileError);
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

            // Fetch referrals (active referrals) - only if we have patient profile
            let activeReferrals: ReferralDto[] = [];
            if (patientProfile?.id) {
                try {
                    const referralsResponse = await ReferralApi.getReferralsByPatient(patientProfile.id);
                    const referrals = referralsResponse.data.data?.content || [];

                    // Filter active referrals (not expired, cancelled, or completed)
                    activeReferrals = referrals.filter((referral) => {
                        const expiryDate = dayjs(referral.expiryDate);
                        const isActive =
                            expiryDate.isAfter(dayjs()) &&
                            referral.status !== ReferralStatus.EXPIRED &&
                            referral.status !== ReferralStatus.CANCELLED &&
                            referral.status !== ReferralStatus.COMPLETED;
                        return isActive;
                    });
                } catch (referralError) {
                    console.warn("Failed to fetch referrals:", referralError);
                }
            }

            // Fetch prescriptions (active prescriptions) - only if we have patient profile
            let activePrescriptions: PrescriptionDto[] = [];
            if (patientProfile?.id) {
                try {
                    const prescriptionsResponse = await PrescriptionApi.getPrescriptionsByPatient(patientProfile.id);
                    const prescriptions = prescriptionsResponse.data.data?.content || [];

                    // Filter active prescriptions (not expired or cancelled)
                    activePrescriptions = prescriptions.filter((prescription) => {
                        const isActive = prescription.status !== "EXPIRED" && prescription.status !== "CANCELLED";
                        return isActive;
                    });
                } catch (prescriptionError) {
                    console.warn("Failed to fetch prescriptions:", prescriptionError);
                }
            }

            setDashboardData({
                appointments: upcomingAppointments,
                referrals: activeReferrals,
                prescriptions: activePrescriptions,
                patientProfile,
                stats: {
                    upcomingAppointments: upcomingAppointments.length,
                    activeReferrals: activeReferrals.length,
                    activePrescriptions: activePrescriptions.length,
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

    // Calculate days remaining for referral
    const getDaysRemaining = (expiryDate: string): number => {
        return dayjs(expiryDate).diff(dayjs(), "day");
    };

    // Handle refresh
    const handleRefresh = () => {
        fetchDashboardData();
    };

    if (error) {
        return (
            <div className="container mx-auto px-4 py-6">
                <Alert
                    message="Error Loading Dashboard"
                    description={error}
                    type="error"
                    showIcon
                    action={
                        <Button size="small" danger onClick={handleRefresh}>
                            Retry
                        </Button>
                    }
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
                        Welcome back, {dashboardData.patientProfile?.name || "Patient"}!
                    </Title>
                    <Text className="text-gray-600 text-sm md:text-base">
                        Here&apos;s your health overview for today
                    </Text>
                </div>
            </div>

            {/* Quick Stats */}
            <Row gutter={[16, 16]} className="mb-8">
                <Col xs={24} sm={12} md={8}>
                    <Card className="shadow-lg border-0 bg-white" styles={{ body: { padding: "24px" } }}>
                        <Statistic
                            title={
                                <div className="flex items-center">
                                    <Calendar className="w-6 h-6 text-blue-500 mr-3" />
                                    <Text className="text-gray-700 text-sm md:text-lg font-bold">
                                        Upcoming Appointments
                                    </Text>
                                </div>
                            }
                            value={dashboardData.stats.upcomingAppointments}
                            valueStyle={{ color: "#1890ff", fontSize: "32px", fontWeight: "bold" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Card className="shadow-lg border-0 bg-white" styles={{ body: { padding: "24px" } }}>
                        <Statistic
                            title={
                                <div className="flex items-center">
                                    <FileText className="w-6 h-6 text-green-500 mr-3" />
                                    <Text className="text-gray-700 text-sm md:text-lg font-bold">Active Referrals</Text>
                                </div>
                            }
                            value={dashboardData.stats.activeReferrals}
                            valueStyle={{ color: "#52c41a", fontSize: "32px", fontWeight: "bold" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
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
            </Row>

            {/* Quick Actions */}
            <Row gutter={[16, 16]} className="mb-8">
                <Col xs={24}>
                    <Card
                        title={
                            <div className="flex items-center">
                                <Shield className="w-6 h-6 text-blue-500 mr-3" />
                                <Title level={4} className="m-0 text-gray-800 text-base md:text-lg">
                                    Quick Actions
                                </Title>
                            </div>
                        }
                        className="shadow-lg border-0 bg-white"
                        styles={{ body: { padding: "24px" } }}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <Link href="/patient/appointment/book" className="no-underline">
                                <Card
                                    hoverable
                                    className="text-center py-6 h-full justify-center border-2 border-blue-200 hover:border-blue-500 transition-all duration-200"
                                >
                                    <div className="flex flex-col items-center justify-center">
                                        <Calendar className="w-12 h-12 text-blue-500 mb-4" />
                                        <Text strong className="text-gray-800 text-sm md:text-lg">
                                            Book Appointment
                                        </Text>
                                        <Text className="text-gray-500 text-xs md:text-sm mt-2">
                                            Schedule a consultation
                                        </Text>
                                    </div>
                                </Card>
                            </Link>
                            <Link href="/patient/documents" className="no-underline">
                                <Card
                                    hoverable
                                    className="text-center py-6 h-full flex flex-col justify-center border-2 border-green-200 hover:border-green-500 transition-all duration-200"
                                >
                                    <div className="flex flex-col items-center justify-center">
                                        <FileText className="w-12 h-12 text-green-500 mb-4" />
                                        <Text strong className="text-gray-800 text-sm md:text-lg">
                                            Manage Documents
                                        </Text>
                                        <Text className="text-gray-500 text-xs md:text-sm mt-2">
                                            View your health data
                                        </Text>
                                    </div>
                                </Card>
                            </Link>
                            <Link href="/patient/referrals" className="no-underline">
                                <Card
                                    hoverable
                                    className="text-center py-6 h-full flex flex-col justify-center border-2 border-orange-200 hover:border-orange-500 transition-all duration-200"
                                >
                                    <div className="flex flex-col items-center justify-center">
                                        <Pill className="w-12 h-12 text-orange-500 mb-4" />
                                        <Text strong className="text-gray-800 text-sm md:text-lg">
                                            Manage Referrals
                                        </Text>
                                        <Text className="text-gray-500 text-xs md:text-sm mt-2">
                                            Track your referrals
                                        </Text>
                                    </div>
                                </Card>
                            </Link>
                            <Link href="/patient/family" className="no-underline">
                                <Card
                                    hoverable
                                    className="text-center py-6 h-full flex flex-col justify-center border-2 border-purple-200 hover:border-purple-500 transition-all duration-200"
                                >
                                    <div className="flex flex-col items-center justify-center">
                                        <User className="w-12 h-12 text-purple-500 mb-4" />
                                        <Text strong className="text-gray-800 text-sm md:text-lg">
                                            Family Access
                                        </Text>
                                        <Text className="text-gray-500 text-xs md:text-sm mt-2">
                                            Manage family members
                                        </Text>
                                    </div>
                                </Card>
                            </Link>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Content Rows */}
            <Row gutter={[24, 24]}>
                {/* Left Column */}
                <Col xs={24} lg={16}>
                    {/* Upcoming Appointments */}
                    <Card
                        title={
                            <div className="flex items-center">
                                <Calendar className="w-6 h-6 text-blue-500 mr-3" />
                                <Title level={4} className="m-0 text-gray-800 text-base md:text-lg">
                                    Upcoming Appointments
                                </Title>
                            </div>
                        }
                        extra={
                            <Link href="/patient/appointment" className="text-blue-500 hover:text-blue-700">
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
                                            <Link key="view" href={`/patient/appointment/${appointment.id}`}>
                                                <Button type="link" className="text-blue-500">
                                                    View Details
                                                </Button>
                                            </Link>,
                                        ]}
                                        className="border-b border-gray-100 last:border-b-0"
                                    >
                                        <List.Item.Meta
                                            avatar={
                                                <Avatar
                                                    size={48}
                                                    className="bg-blue-100 text-blue-600"
                                                    icon={<User className="w-6 h-6" />}
                                                />
                                            }
                                            title={
                                                <div className="flex items-center">
                                                    <span className="font-semibold text-gray-800">
                                                        Dr. {appointment.doctor.name}
                                                    </span>
                                                    <Tag
                                                        color={getAppointmentStatusMapping(appointment.status).color}
                                                        className="ml-3"
                                                    >
                                                        {getAppointmentStatusMapping(appointment.status).label}
                                                    </Tag>
                                                </div>
                                            }
                                            description={
                                                <div className="space-y-1">
                                                    <div className="flex items-center text-gray-600">
                                                        <Calendar className="w-4 h-4 mr-2" />
                                                        {formatDate(appointment.appointmentDateTime)} at{" "}
                                                        {formatTime(appointment.appointmentDateTime)}
                                                    </div>
                                                    <div className="flex items-center text-gray-600">
                                                        <Pill className="w-4 h-4 mr-2" />
                                                        {appointment.doctor.specialityList.join(", ")} •{" "}
                                                        {appointment.consultationMode}
                                                    </div>
                                                    {appointment.reasonForVisit && (
                                                        <div className="text-gray-500 text-sm">
                                                            Reason: {appointment.reasonForVisit}
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
                                <Link href="/patient/appointment/book">
                                    <Button type="primary" icon={<Plus className="w-5 h-5" />} size="large">
                                        Book an Appointment
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </Card>
                </Col>

                {/* Right Column */}
                <Col xs={24} lg={8}>
                    {/* Active Referrals */}
                    <Card
                        title={
                            <div className="flex items-center">
                                <FileText className="w-6 h-6 text-green-500 mr-3" />
                                <Title level={4} className="m-0 text-gray-800 text-base md:text-lg">
                                    Active Referrals
                                </Title>
                            </div>
                        }
                        extra={
                            <Link href="/patient/referrals" className="text-green-500 hover:text-green-700">
                                View All <ChevronRight className="w-4 h-4 inline" />
                            </Link>
                        }
                        className="shadow-lg border-0 bg-white mb-6"
                        loading={loading}
                    >
                        {dashboardData.referrals.length > 0 ? (
                            <List
                                itemLayout="vertical"
                                dataSource={dashboardData.referrals}
                                renderItem={(referral) => {
                                    const daysRemaining = getDaysRemaining(referral.expiryDate);
                                    return (
                                        <List.Item className="border-b border-gray-100 last:border-b-0">
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <Text strong className="text-gray-800">
                                                        {referral.reasonForReferral}
                                                    </Text>
                                                    <Tag color={getReferralStatusMapping(referral.status).color}>
                                                        {getReferralStatusMapping(referral.status).label}
                                                    </Tag>
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    <div className="flex items-center mb-1">
                                                        <User className="w-4 h-4 mr-1" />
                                                        Dr. {referral.referringDoctor.name}
                                                    </div>
                                                    <div className="flex items-center mb-2">
                                                        <Clock className="w-4 h-4 mr-1" />
                                                        Expires: {formatDate(referral.expiryDate)}
                                                    </div>
                                                    <div className="flex items-center">
                                                        <AlertCircle className="w-4 h-4 mr-1" />
                                                        <Text
                                                            type={daysRemaining < 7 ? "danger" : "secondary"}
                                                            strong={daysRemaining < 7}
                                                        >
                                                            {daysRemaining} days remaining
                                                        </Text>
                                                    </div>
                                                </div>
                                            </div>
                                        </List.Item>
                                    );
                                }}
                            />
                        ) : (
                            <Empty description="No active referrals" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        )}
                    </Card>

                    {/* Active Prescriptions */}
                    <Card
                        title={
                            <div className="flex items-center">
                                <Pill className="w-6 h-6 text-purple-500 mr-3" />
                                <Title level={4} className="m-0 text-gray-800 text-base md:text-lg">
                                    Active Prescriptions
                                </Title>
                            </div>
                        }
                        extra={
                            <Link href="/patient/prescription" className="text-purple-500 hover:text-purple-700">
                                View All <ChevronRight className="w-4 h-4 inline" />
                            </Link>
                        }
                        className="shadow-lg border-0 bg-white"
                        loading={loading}
                    >
                        {dashboardData.prescriptions.length > 0 ? (
                            <List
                                itemLayout="horizontal"
                                dataSource={dashboardData.prescriptions}
                                renderItem={(prescription) => (
                                    <List.Item className="border-b border-gray-100 last:border-b-0">
                                        <List.Item.Meta
                                            title={
                                                <div className="flex items-center justify-between">
                                                    <span className="font-semibold text-gray-800">
                                                        {prescription.prescriptionNumber}
                                                    </span>
                                                    <Tag color={getPrescriptionStatusMapping(prescription.status).color} className="ml-2">
                                                        {getPrescriptionStatusMapping(prescription.status).label}
                                                    </Tag>
                                                </div>
                                            }
                                            description={
                                                <div className="space-y-1">
                                                    <div className="flex items-center text-gray-600">
                                                        <Calendar className="w-4 h-4 mr-1" />
                                                        {dayjs(Number(prescription.createdAt) * 1000).format("DD/MM/YYYY")}
                                                    </div>
                                                    <div className="flex items-center text-gray-600">
                                                        <User className="w-4 h-4 mr-1" />
                                                        Dr. {prescription.appointment.doctor.name}
                                                    </div>
                                                </div>
                                            }
                                        />
                                    </List.Item>
                                )}
                            />
                        ) : (
                            <Empty description="No active prescriptions" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        )}
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Component;
