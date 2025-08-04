"use client";

import { Card, Typography, Tag, Button, Tooltip, Avatar, Badge, Popconfirm, Space } from "antd";
import {
    Calendar,
    Clock,
    User,
    Building2,
    FileText,
    Info,
    AlertCircle,
    CheckCircle,
    XCircle,
    Star,
    ExternalLink,
    ArrowRight,
    Phone,
    Eye,
} from "lucide-react";
import { ReferralDto, ReferralStatus, ReferralPriority, ReferralType } from "@/app/api/referral/props";
import dayjs from "dayjs";

const { Text, Title } = Typography;

interface DoctorReferralCardProps {
    referral: ReferralDto;
    onViewDetails: (referral: ReferralDto) => void;
    onAccept?: (referralId: string) => void;
    onReject?: (referral: ReferralDto) => void;
    onScheduleAppointment?: (referral: ReferralDto) => void;
    actionLoading?: string | null;
    isIncoming?: boolean; // true for referrals received by doctor, false for referrals sent by doctor
    getStatusColor?: (status: ReferralStatus) => string;
    getStatusIcon?: (status: ReferralStatus) => React.ReactNode;
    getPriorityColor?: (priority: ReferralPriority) => string;
    getPriorityIcon?: (priority: ReferralPriority) => React.ReactNode;
}

const DoctorReferralCard: React.FC<DoctorReferralCardProps> = ({
    referral,
    onViewDetails,
    onAccept,
    onReject,
    onScheduleAppointment,
    actionLoading,
    isIncoming = false,
    getStatusColor,
    getStatusIcon,
    getPriorityColor,
    getPriorityIcon,
}) => {
    const {
        id,
        referralNumber,
        referringDoctor,
        referredDoctor,
        referralType,
        status,
        priority,
        clinicalSummary,
        reasonForReferral,
        expiryDate,
        createdAt,
        patient,
        externalDoctorName,
        externalDoctorSpeciality,
        externalFacilityName,
        externalFacilityAddress,
        externalContactNumber,
        externalEmail,
        scheduledAppointment,
    } = referral;

    // Use provided functions or fall back to default logic
    const getStatusColorFn = getStatusColor || ((status: ReferralStatus) => {
        switch (status) {
            case ReferralStatus.ACCEPTED:
                return "green";
            case ReferralStatus.PENDING:
                return "orange";
            case ReferralStatus.REJECTED:
                return "red";
            case ReferralStatus.SCHEDULED:
                return "blue";
            case ReferralStatus.COMPLETED:
                return "purple";
            case ReferralStatus.EXPIRED:
                return "default";
            case ReferralStatus.CANCELLED:
                return "default";
            default:
                return "blue";
        }
    });

    const getStatusIconFn = getStatusIcon || ((status: ReferralStatus) => {
        switch (status) {
            case ReferralStatus.ACCEPTED:
                return <CheckCircle className="w-3 h-3" />;
            case ReferralStatus.PENDING:
                return <Clock className="w-3 h-3" />;
            case ReferralStatus.REJECTED:
                return <XCircle className="w-3 h-3" />;
            case ReferralStatus.SCHEDULED:
                return <Calendar className="w-3 h-3" />;
            case ReferralStatus.COMPLETED:
                return <CheckCircle className="w-3 h-3" />;
            case ReferralStatus.EXPIRED:
                return <AlertCircle className="w-3 h-3" />;
            case ReferralStatus.CANCELLED:
                return <XCircle className="w-3 h-3" />;
            default:
                return <Info className="w-3 h-3" />;
        }
    });

    const getPriorityColorFn = getPriorityColor || ((priority: ReferralPriority) => {
        switch (priority) {
            case ReferralPriority.EMERGENCY:
                return "red";
            case ReferralPriority.URGENT:
                return "orange";
            case ReferralPriority.ROUTINE:
                return "green";
            default:
                return "default";
        }
    });

    const getPriorityIconFn = getPriorityIcon || ((priority: ReferralPriority) => {
        switch (priority) {
            case ReferralPriority.EMERGENCY:
                return <AlertCircle className="w-3 h-3" />;
            case ReferralPriority.URGENT:
                return <Clock className="w-3 h-3" />;
            case ReferralPriority.ROUTINE:
                return <Star className="w-3 h-3" />;
            default:
                return <Star className="w-3 h-3" />;
        }
    });



    // Format dates for better display
    const formatDate = (dateString: string) => {
        return dayjs(Number(dateString) * 1000).format("MMM DD, YYYY");
    };

    // Calculate days remaining for active referrals
    const calculateDaysRemaining = () => {
        if (
            status === ReferralStatus.EXPIRED ||
            status === ReferralStatus.CANCELLED ||
            status === ReferralStatus.REJECTED ||
            status === ReferralStatus.COMPLETED
        ) {
            return null;
        }

        const today = dayjs();
        const expiry = dayjs(expiryDate);
        const diffDays = expiry.diff(today, "day");

        return diffDays > 0 ? diffDays : 0;
    };

    const daysRemaining = calculateDaysRemaining();

    // Get doctor info based on direction
    const getDoctorInfo = () => {
        if (isIncoming) {
            // For incoming referrals, show referring doctor
            return {
                name: referringDoctor.name,
                facility: referringDoctor.facility?.name || "Medical Center",
                specialty: referringDoctor.specialityList?.[0] || "General Practice",
                contact: referringDoctor.phone,
                email: referringDoctor.email,
                address: referringDoctor.facility?.address,
                profileImage: referringDoctor.profileImageUrl,
                type: "Referring",
                color: "blue",
            };
        } else {
            // For outgoing referrals, show referred doctor
            if (referralType === ReferralType.INTERNAL && referredDoctor) {
                return {
                    name: referredDoctor.name,
                    facility: referredDoctor.facility?.name || "Medical Center",
                    specialty: referredDoctor.specialityList?.[0] || "General Practice",
                    contact: referredDoctor.phone,
                    email: referredDoctor.email,
                    address: referredDoctor.facility?.address,
                    profileImage: referredDoctor.profileImageUrl,
                    type: "Referred To",
                    color: "green",
                };
            } else {
                return {
                    name: externalDoctorName || "External Doctor",
                    facility: externalFacilityName || "External Facility",
                    specialty: externalDoctorSpeciality || "Specialty",
                    contact: externalContactNumber,
                    email: externalEmail,
                    address: externalFacilityAddress,
                    profileImage: null,
                    type: "External Doctor",
                    color: "purple",
                };
            }
        }
    };

    const doctorInfo = getDoctorInfo();

    return (
        <Card
            className="w-full hover:shadow-md transition-all duration-200 mb-4 border-2 border-gray-200 shadow-sm bg-white"
            styles={{ body: { padding: "20px" } }}
            data-testid={`doctor-referral-card-${id}`}
        >
            <div className="flex flex-col lg:flex-row justify-between gap-4">
                <div className="flex-grow">
                    {/* Header with Status and Priority */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-2">
                        <div className="flex items-center gap-2">
                            <Title level={5} className="m-0 text-gray-800 text-base sm:text-lg">
                                {reasonForReferral}
                            </Title>
                            <Badge
                                count={referralType === ReferralType.EXTERNAL ? "EXT" : "INT"}
                                style={{
                                    backgroundColor: referralType === ReferralType.EXTERNAL ? "#7c3aed" : "#22c55e",
                                    fontSize: "10px",
                                }}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Tag
                                color={getStatusColorFn(status)}
                                icon={getStatusIconFn(status)}
                                className="text-xs sm:text-sm font-medium"
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
                            </Tag>
                            <Tag
                                color={getPriorityColorFn(priority)}
                                icon={getPriorityIconFn(priority)}
                                className="text-xs sm:text-sm font-medium"
                            >
                                {priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase()}
                            </Tag>
                        </div>
                    </div>

                    {/* Patient Info */}
                    <div className="mb-3">
                        <div className="flex items-center gap-2 mb-2">
                            <User className="w-4 h-4 text-green-600" />
                            <Text strong className="text-sm text-gray-700">
                                Patient
                            </Text>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 gap-2 ml-6">
                            <Avatar
                                size={32}
                                src={patient.profileImageUrl}
                                icon={<User className="w-4 h-4" />}
                                className="mr-2 bg-green-100 text-green-600"
                            />
                            <Text className="text-sm">{patient.name}</Text>
                            <span className="text-gray-400">•</span>
                            <Text className="text-sm">{patient.gender}</Text>
                            {patient.phone && (
                                <>
                                    <span className="text-gray-400">•</span>
                                    <Text className="text-sm">{patient.phone}</Text>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Doctor Info */}
                    <div className="mb-3">
                        <div className="flex items-center gap-2 mb-2">
                            {doctorInfo.color === "blue" && <ArrowRight className="w-4 h-4 text-blue-500" />}
                            {doctorInfo.color === "green" && <ArrowRight className="w-4 h-4 text-green-500" />}
                            {doctorInfo.color === "purple" && <ExternalLink className="w-4 h-4 text-purple-500" />}
                            <Text strong className="text-sm text-gray-700">
                                {doctorInfo.type}
                            </Text>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-600 gap-2 ml-6">
                            <div className="flex items-center">
                                <Avatar
                                    size={32}
                                    src={doctorInfo.profileImage}
                                    icon={<User className="w-4 h-4" />}
                                    className={`mr-2 ${doctorInfo.color === "blue"
                                        ? "bg-blue-100 text-blue-600"
                                        : doctorInfo.color === "green"
                                            ? "bg-green-100 text-green-600"
                                            : "bg-purple-100 text-purple-600"
                                        }`}
                                />
                                <Text className="text-sm">Dr. {doctorInfo.name}</Text>
                            </div>
                            <div className="flex items-center">
                                <Building2 className="w-3 h-3 mr-1 text-gray-500" />
                                <Text className="text-sm">{doctorInfo.facility}</Text>
                            </div>
                            <div className="flex items-center">
                                <FileText className="w-3 h-3 mr-1 text-gray-500" />
                                <Text className="text-sm">{doctorInfo.specialty}</Text>
                            </div>
                            {doctorInfo.contact && (
                                <div className="flex items-center">
                                    <Phone className="w-3 h-3 mr-1 text-gray-500" />
                                    <Text className="text-sm">{doctorInfo.contact}</Text>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Clinical Summary */}
                    {clinicalSummary && (
                        <Text className="block mb-3 text-sm text-gray-600 line-clamp-2 italic ml-6">
                            {clinicalSummary}
                        </Text>
                    )}

                    {/* Dates and Remaining Time */}
                    <div className="flex flex-wrap gap-4 text-sm ml-6">
                        <div className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1 text-gray-500" />
                            <Text type="secondary" className="text-xs sm:text-sm">
                                Created: {formatDate(createdAt)}
                            </Text>
                        </div>
                        <div className="flex items-center">
                            <Clock className="w-3 h-3 mr-1 text-gray-500" />
                            <Text type="secondary" className="text-xs sm:text-sm">
                                Expires: {dayjs(expiryDate).format("MMM DD, YYYY")}
                            </Text>
                        </div>

                        {daysRemaining !== null && (
                            <Text
                                type={daysRemaining < 7 ? "danger" : "secondary"}
                                strong={daysRemaining < 7}
                                className="text-xs sm:text-sm"
                            >
                                {daysRemaining} days remaining
                            </Text>
                        )}
                    </div>

                    {/* Referral Number */}
                    <div className="mt-3 ml-6">
                        <Text type="secondary" className="text-xs">
                            Referral #: {referralNumber}
                        </Text>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 min-w-[140px]">
                    <Tooltip title="View Details">
                        <Button
                            type="default"
                            icon={<Eye className="w-3 h-3" />}
                            onClick={() => onViewDetails(referral)}
                            className="w-full text-xs sm:text-sm border-green-600 text-green-600 hover:bg-green-50"
                            size="middle"
                        >
                            View Details
                        </Button>
                    </Tooltip>

                    {/* Doctor-specific action buttons for incoming referrals */}
                    {isIncoming && (
                        <>
                            {status === ReferralStatus.PENDING && (
                                <Space direction="vertical" size="small" className="w-full">
                                    <Popconfirm
                                        title="Accept this referral?"
                                        description="You will be able to schedule an appointment after accepting."
                                        onConfirm={() => onAccept?.(id)}
                                        okText="Accept"
                                        cancelText="Cancel"
                                        okButtonProps={{
                                            className: "bg-green-600 hover:bg-green-700 border-green-600",
                                        }}
                                    >
                                        <Button
                                            type="primary"
                                            icon={<CheckCircle className="w-3 h-3" />}
                                            size="middle"
                                            loading={actionLoading === id}
                                            className="w-full bg-green-600 hover:bg-green-700 border-green-600"
                                        >
                                            Accept
                                        </Button>
                                    </Popconfirm>

                                    <Button
                                        danger
                                        icon={<XCircle className="w-3 h-3" />}
                                        size="middle"
                                        onClick={() => onReject?.(referral)}
                                        loading={actionLoading === id}
                                        className="w-full"
                                    >
                                        Reject
                                    </Button>
                                </Space>
                            )}

                            {status === ReferralStatus.ACCEPTED && (
                                <Button
                                    type="primary"
                                    icon={<Calendar className="w-3 h-3" />}
                                    size="middle"
                                    onClick={() => onScheduleAppointment?.(referral)}
                                    className="w-full bg-green-600 hover:bg-green-700 border-green-600"
                                >
                                    Schedule Appointment
                                </Button>
                            )}
                        </>
                    )}

                    {/* View appointment button for scheduled referrals */}
                    {status === ReferralStatus.SCHEDULED && scheduledAppointment && (
                        <Button
                            type="default"
                            icon={<ExternalLink className="w-3 h-3" />}
                            onClick={() => {
                                // Navigate to appointment details
                                window.location.href = `/doctor/appointment/${scheduledAppointment.id}`;
                            }}
                            className="w-full text-xs sm:text-sm"
                            size="middle"
                        >
                            View Appointment
                        </Button>
                    )}
                </div>
            </div>
        </Card>
    );
};

export default DoctorReferralCard;
