import React, { useState, useEffect } from "react";
import { Card, Avatar, Typography, Tag, Button } from "antd";
import {
    Calendar,
    Clock,
    User,
    Eye,
    CheckCircle,
    AlertTriangle,
    XCircle,
    Trash2,
    Video,
    RotateCw,
    FileText,
    MapPin,
    Phone,
} from "lucide-react";
import { AppointmentDto, AppointmentStatus } from "@/app/api/appointment/props";
import { parseLocalDateTime } from "@/app/utils/DateUtils";

const { Title, Text } = Typography;

interface AppointmentCardProps {
    appointment: AppointmentDto;
    onView: (appointment: AppointmentDto) => void;
    onCancel?: (appointment: AppointmentDto) => void;
}

// Get status color
const getStatusColor = (status: AppointmentStatus): string => {
    switch (status) {
        case "PENDING":
            return "warning";
        case "PENDING_PAYMENT":
            return "orange";
        case "CONFIRMED":
            return "processing";
        case "READY_FOR_CALL":
            return "cyan";
        case "IN_PROGRESS":
            return "blue";
        case "COMPLETED":
            return "success";
        case "CANCELLED":
        case "NO_SHOW":
            return "error";
        default:
            return "default";
    }
};

// Get status icon
const getStatusIcon = (status: AppointmentStatus) => {
    switch (status) {
        case "PENDING":
            return <Clock className="w-4 h-4" />;
        case "PENDING_PAYMENT":
            return <AlertTriangle className="w-4 h-4" />;
        case "CONFIRMED":
            return <CheckCircle className="w-4 h-4" />;
        case "READY_FOR_CALL":
            return <Video className="w-4 h-4" />;
        case "IN_PROGRESS":
            return <RotateCw className="w-4 h-4 animate-spin" />;
        case "COMPLETED":
            return <CheckCircle className="w-4 h-4" />;
        case "CANCELLED":
        case "NO_SHOW":
            return <XCircle className="w-4 h-4" />;
        default:
            return <AlertTriangle className="w-4 h-4" />;
    }
};

export const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment, onView, onCancel }) => {
    // Add isMobile detection
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    return (
        <Card className="mb-4 hover:shadow-lg transition-shadow duration-200 sm:p-4">
            <div className="space-y-3 sm:space-y-4">
                {/* Header with Doctor Info and Status */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                    <div className="flex flex-row items-center space-x-2 sm:space-x-3 mb-2">
                        <Avatar
                            size={40}
                            className="sm:w-12 sm:h-12" // Responsive avatar size
                            src={appointment.doctor.profileImageUrl}
                            icon={<User size={16} className="sm:w-5 sm:h-5" />}
                        />
                        <div className="min-w-0 flex-1">
                            {" "}
                            {/* Prevent text overflow */}
                            <Title level={5} className="mb-0 mt-0 text-sm sm:text-base truncate">
                                Dr. {appointment.doctor.name}
                            </Title>
                            <Text className="text-gray-500 text-xs sm:text-sm truncate">
                                {appointment.doctor.specialityList?.[0] || "General Practice"}
                            </Text>
                        </div>
                    </div>
                    <div className="flex flex-row">
                        <Tag
                            color={getStatusColor(appointment.status as AppointmentStatus)}
                            className="px-2 py-1 text-xs sm:text-sm"
                        >
                            <span className="flex items-center gap-1">
                                {getStatusIcon(appointment.status as AppointmentStatus)}
                                <span className="hidden xs:inline">{appointment.status.replaceAll("_", " ")}</span>
                                <span className="xs:hidden">{appointment.status.replaceAll("_", " ")}</span>
                            </span>
                        </Tag>
                        <Tag
                            color={appointment.consultationMode === "VIRTUAL" ? "blue" : "green"}
                            className="px-2 py-1 text-xs sm:text-sm"
                        >
                            <span className="hidden sm:inline">
                                {appointment.consultationMode === "VIRTUAL" ? "Virtual" : "Physical"}
                            </span>
                            <span className="sm:hidden">
                                {appointment.consultationMode === "VIRTUAL" ? "Virtual" : "Physical"}
                            </span>
                        </Tag>
                    </div>
                </div>

                {/* Appointment Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <Calendar size={14} className="text-blue-600 sm:w-4 sm:h-4 flex-shrink-0" />
                            <Text strong className="text-xs sm:text-sm">
                                {parseLocalDateTime(appointment.appointmentDateTime).format("MMM DD, YYYY")}
                            </Text>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Clock size={14} className="text-green-600 sm:w-4 sm:h-4 flex-shrink-0" />
                            <Text className="text-xs sm:text-sm">
                                {parseLocalDateTime(appointment.appointmentDateTime).format("h:mm A")} (
                                {appointment.durationMinutes} min)
                            </Text>
                        </div>
                        <div className="flex items-center space-x-2">
                            <User size={14} className="text-purple-600 sm:w-4 sm:h-4 flex-shrink-0" />
                            <Text className="text-xs sm:text-sm truncate">{appointment.patient.name}</Text>
                        </div>
                    </div>

                    <div className="space-y-2">
                        {appointment.doctor.facility && (
                            <div className="flex items-center space-x-2">
                                <MapPin size={14} className="text-orange-600 sm:w-4 sm:h-4 flex-shrink-0" />
                                <Text className="text-xs sm:text-sm truncate">{appointment.doctor.facility.name}</Text>
                            </div>
                        )}
                        {appointment.doctor.phone && (
                            <div className="flex items-center space-x-2">
                                <Phone size={14} className="text-gray-600 sm:w-4 sm:h-4 flex-shrink-0" />
                                <Text className="text-xs sm:text-sm truncate">{appointment.doctor.phone}</Text>
                            </div>
                        )}
                        {appointment.hasAttachedDocuments && (
                            <div className="flex items-center space-x-2">
                                <FileText size={14} className="text-blue-600 sm:w-4 sm:h-4 flex-shrink-0" />
                                <Text className="text-xs sm:text-sm text-blue-600">
                                    {appointment.attachedDocuments.length} document(s)
                                </Text>
                            </div>
                        )}
                    </div>
                </div>

                {/* Reason for Visit */}
                {appointment.reasonForVisit && (
                    <div className="bg-gray-50 p-2 sm:p-3 rounded-lg">
                        <Text strong className="text-gray-700 text-xs sm:text-sm">
                            Reason for Visit:
                        </Text>
                        <br />
                        <Text className="text-gray-600 text-xs sm:text-sm line-clamp-2 sm:line-clamp-3">
                            {appointment.reasonForVisit}
                        </Text>
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 pt-2 border-t border-gray-100">
                    <div className="text-xs text-gray-500">
                        Created: {parseLocalDateTime(appointment.createdAt).format("MMM DD, YYYY")}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                            type="primary"
                            size={isMobile ? "small" : "middle"}
                            icon={<Eye className={isMobile ? "w-4 h-4" : "w-5 h-5"} />}
                            onClick={() => onView(appointment)}
                            className={`bg-blue-600 border-blue-600 ${isMobile ? "text-xs px-2 py-1" : "text-base px-4 py-2"
                                } flex-1 sm:flex-none`}
                        >
                            <span className="hidden sm:inline">View Details</span>
                            <span className="sm:hidden">View</span>
                        </Button>
                        {(appointment.status === "PENDING" || appointment.status === "PENDING_PAYMENT") && onCancel && (
                            <Button
                                type="primary"
                                danger
                                size={isMobile ? "small" : "middle"}
                                icon={<Trash2 className={isMobile ? "w-4 h-4" : "w-5 h-5"} />}
                                onClick={() => onCancel(appointment)}
                                className={`${isMobile ? "text-xs px-2 py-1" : "text-base px-4 py-2"
                                    } flex-1 sm:flex-none`}
                            >
                                <span className="hidden sm:inline">Cancel</span>
                                <span className="sm:hidden">Cancel</span>
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
};
