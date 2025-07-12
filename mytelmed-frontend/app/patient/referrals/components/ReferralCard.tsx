"use client";

import { Card, Typography, Tag, Button, Tooltip, Avatar, Badge } from "antd";
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
    Mail,
    MapPin,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ReferralCardProps } from "../props";
import { ReferralStatus, ReferralPriority, ReferralType } from "@/app/api/referral/props";
import dayjs from "dayjs";

const { Text, Title } = Typography;

const ReferralCard: React.FC<ReferralCardProps> = ({ referral, onViewDetails }) => {
    const router = useRouter();
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
        externalDoctorName,
        externalDoctorSpeciality,
        externalFacilityName,
        externalFacilityAddress,
        externalContactNumber,
        externalEmail,
        scheduledAppointment,
    } = referral;

    const getStatusColor = (status: ReferralStatus) => {
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
    };

    const getStatusIcon = (status: ReferralStatus) => {
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
    };

    const getPriorityColor = (priority: ReferralPriority) => {
        switch (priority) {
            case ReferralPriority.EMERGENCY:
                return "red";
            case ReferralPriority.URGENT:
                return "orange";
            case ReferralPriority.ROUTINE:
                return "blue";
            default:
                return "default";
        }
    };

    const getPriorityIcon = (priority: ReferralPriority) => {
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
    };

    // Format dates for better display
    const formatDate = (dateString: string) => {
        return dayjs(dateString).format("MMM DD, YYYY");
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

    // Get referring doctor info
    const getReferringDoctorInfo = () => {
        return {
            name: referringDoctor.name,
            facility: referringDoctor.facility?.name || "Medical Center",
            specialty: referringDoctor.specialityList?.[0] || "General Practice",
            contact: referringDoctor.phone,
            email: referringDoctor.email,
            address: referringDoctor.facility?.address,
        };
    };

    // Get referred doctor info
    const getReferredDoctorInfo = () => {
        if (!referredDoctor) return null;

        return {
            name: referredDoctor.name,
            facility: referredDoctor.facility?.name || "Medical Center",
            specialty: referredDoctor.specialityList?.[0] || "General Practice",
            contact: referredDoctor.phone,
            email: referredDoctor.email,
            address: referredDoctor.facility?.address,
        };
    };

    // Get external doctor info
    const getExternalDoctorInfo = () => {
        if (referralType !== ReferralType.EXTERNAL) return null;

        return {
            name: externalDoctorName || "External Doctor",
            facility: externalFacilityName || "External Facility",
            specialty: externalDoctorSpeciality || "Specialty",
            contact: externalContactNumber,
            email: externalEmail,
            address: externalFacilityAddress,
        };
    };

    const referringDoctorInfo = getReferringDoctorInfo();
    const referredDoctorInfo = getReferredDoctorInfo();
    const externalDoctorInfo = getExternalDoctorInfo();

    const handleViewAppointment = () => {
        if (scheduledAppointment) {
            router.push(`/patient/appointments/${scheduledAppointment.id}`);
        }
    };

    return (
        <Card
            className="w-full hover:shadow-md transition-all duration-200 mb-4 border-2 border-gray-200 shadow-sm bg-white"
            styles={{ body: { padding: "20px" } }}
            data-testid={`referral-card-${id}`}
        >
            <div className="flex flex-col lg:flex-row justify-between gap-4">
                <div className="flex-grow">
                    {/* Header with Status and Priority */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-2">
                        <div className="flex items-center gap-2">
                            <Title level={5} className="m-0 text-blue-800 text-base sm:text-lg">
                                {reasonForReferral}
                            </Title>
                            <Badge
                                count={referralType === ReferralType.EXTERNAL ? "EXT" : "INT"}
                                style={{
                                    backgroundColor: referralType === ReferralType.EXTERNAL ? "#722ed1" : "#1890ff",
                                    fontSize: "10px",
                                }}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Tag
                                color={getStatusColor(status)}
                                icon={getStatusIcon(status)}
                                className="text-xs sm:text-sm font-medium"
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
                            </Tag>
                            <Tag
                                color={getPriorityColor(priority)}
                                icon={getPriorityIcon(priority)}
                                className="text-xs sm:text-sm font-medium"
                            >
                                {priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase()}
                            </Tag>
                        </div>
                    </div>

                    {/* Referring Doctor Info */}
                    <div className="mb-3">
                        <div className="flex items-center gap-2 mb-2">
                            <User className="w-4 h-4 text-blue-500" />
                            <Text strong className="text-sm text-gray-700">
                                Referring Doctor
                            </Text>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-600 gap-2 ml-6">
                            <div className="flex items-center">
                                <Avatar
                                    size={32}
                                    src={referringDoctor.profileImageUrl}
                                    icon={<User className="w-4 h-4" />}
                                    className="mr-2 bg-blue-100 text-blue-600"
                                />
                                <Text className="text-sm">Dr. {referringDoctorInfo.name}</Text>
                            </div>
                            <div className="flex items-center">
                                <Building2 className="w-3 h-3 mr-1 text-gray-500" />
                                <Text className="text-sm">{referringDoctorInfo.facility}</Text>
                            </div>
                            <div className="flex items-center">
                                <FileText className="w-3 h-3 mr-1 text-gray-500" />
                                <Text className="text-sm">{referringDoctorInfo.specialty}</Text>
                            </div>
                        </div>
                    </div>

                    {/* Referred Doctor Info (if available) */}
                    {referredDoctorInfo && (
                        <div className="mb-3">
                            <div className="flex items-center gap-2 mb-2">
                                <ArrowRight className="w-4 h-4 text-green-500" />
                                <Text strong className="text-sm text-gray-700">
                                    Referred To
                                </Text>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-600 gap-2 ml-6">
                                <div className="flex items-center">
                                    <Avatar
                                        size={32}
                                        src={referredDoctor?.profileImageUrl}
                                        icon={<User className="w-4 h-4" />}
                                        className="mr-2 bg-green-100 text-green-600"
                                    />
                                    <Text className="text-sm">Dr. {referredDoctorInfo.name}</Text>
                                </div>
                                <div className="flex items-center">
                                    <Building2 className="w-3 h-3 mr-1 text-gray-500" />
                                    <Text className="text-sm">{referredDoctorInfo.facility}</Text>
                                </div>
                                <div className="flex items-center">
                                    <FileText className="w-3 h-3 mr-1 text-gray-500" />
                                    <Text className="text-sm">{referredDoctorInfo.specialty}</Text>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* External Doctor Info (if external referral) */}
                    {externalDoctorInfo && (
                        <div className="mb-3">
                            <div className="flex items-center gap-2 mb-2">
                                <ExternalLink className="w-4 h-4 text-purple-500" />
                                <Text strong className="text-sm text-gray-700">
                                    External Doctor
                                </Text>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-600 gap-2 ml-6">
                                <div className="flex items-center">
                                    <Avatar
                                        size={32}
                                        icon={<User className="w-4 h-4" />}
                                        className="mr-2 bg-purple-100 text-purple-600"
                                    />
                                    <Text className="text-sm">Dr. {externalDoctorInfo.name}</Text>
                                </div>
                                <div className="flex items-center">
                                    <Building2 className="w-3 h-3 mr-1 text-gray-500" />
                                    <Text className="text-sm">{externalDoctorInfo.facility}</Text>
                                </div>
                                <div className="flex items-center">
                                    <FileText className="w-3 h-3 mr-1 text-gray-500" />
                                    <Text className="text-sm">{externalDoctorInfo.specialty}</Text>
                                </div>
                                {externalDoctorInfo.contact && (
                                    <div className="flex items-center">
                                        <Phone className="w-3 h-3 mr-1 text-gray-500" />
                                        <Text className="text-sm">{externalDoctorInfo.contact}</Text>
                                    </div>
                                )}
                                {externalDoctorInfo.email && (
                                    <div className="flex items-center">
                                        <Mail className="w-3 h-3 mr-1 text-gray-500" />
                                        <Text className="text-sm">{externalDoctorInfo.email}</Text>
                                    </div>
                                )}
                                {externalDoctorInfo.address && (
                                    <div className="flex items-center">
                                        <MapPin className="w-3 h-3 mr-1 text-gray-500" />
                                        <Text className="text-sm">{externalDoctorInfo.address}</Text>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

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
                                Issued: {formatDate(createdAt)}
                            </Text>
                        </div>
                        <div className="flex items-center">
                            <Clock className="w-3 h-3 mr-1 text-gray-500" />
                            <Text type="secondary" className="text-xs sm:text-sm">
                                Expires: {formatDate(expiryDate)}
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
                <div className="flex flex-col gap-2 min-w-[120px]">
                    <Tooltip title="View Details">
                        <Button
                            type="primary"
                            icon={<Info className="w-3 h-3" />}
                            onClick={() => onViewDetails(referral)}
                            className="w-full text-xs sm:text-sm"
                            size="middle"
                        >
                            Details
                        </Button>
                    </Tooltip>

                    {status === ReferralStatus.SCHEDULED && scheduledAppointment && (
                        <Button
                            type="default"
                            icon={<ExternalLink className="w-3 h-3" />}
                            onClick={handleViewAppointment}
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

export default ReferralCard;
