import React, { useState, useEffect } from "react";
import { Card, Avatar, Typography, Tag, Space, Button } from "antd";
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

// Get status color - using green theme
const getStatusColor = (status: AppointmentStatus): string => {
    switch (status) {
        case "PENDING":
            return "warning";
        case "CONFIRMED":
            return "processing";
        case "READY_FOR_CALL":
            return "cyan";
        case "IN_PROGRESS":
            return "blue";
        case "COMPLETED":
            return "green"; // Changed from "success" to "green"
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
        <Card className="mb-4 hover:shadow-lg transition-shadow duration-200 p-3 sm:p-4 bg-white">
            <div className="space-y-3 sm:space-y-4">
                {/* Header with Patient Info and Status */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                        <Avatar
                            size={40}
                            className="sm:w-12 sm:h-12" // Responsive avatar size
                            src={appointment.patient.profileImageUrl}
                            icon={<User size={16} className="sm:w-5 sm:h-5" />}
                        />
                        <div className="min-w-0 flex-1">
                            {" "}
                            {/* Prevent text overflow */}
                            <Title level={5} className="mb-0 text-sm sm:text-base truncate">
                                {appointment.patient.name}
                            </Title>
                            <Text className="text-gray-500 text-xs sm:text-sm truncate">
                                Patient ID: {appointment.patient.id}
                            </Text>
                        </div>
                    </div>
                    <div className="flex flex-col items-start sm:items-end space-y-1 sm:space-y-2">
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
                            <Calendar size={14} className="text-green-600 sm:w-4 sm:h-4 flex-shrink-0" />
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
                            <User size={14} className="text-green-600 sm:w-4 sm:h-4 flex-shrink-0" />
                            <Text className="text-xs sm:text-sm truncate">
                                {appointment.patient.phone || "No phone number"}
                            </Text>
                        </div>
                    </div>

                    <div className="space-y-2">
                        {appointment.patient.email && (
                            <div className="flex items-center space-x-2">
                                <Phone size={14} className="text-gray-600 sm:w-4 sm:h-4 flex-shrink-0" />
                                <Text className="text-xs sm:text-sm truncate">{appointment.patient.email}</Text>
                            </div>
                        )}
                        {appointment.patient.nric && (
                            <div className="flex items-center space-x-2">
                                <MapPin size={14} className="text-orange-600 sm:w-4 sm:h-4 flex-shrink-0" />
                                <Text className="text-xs sm:text-sm truncate">NRIC: {appointment.patient.nric}</Text>
                            </div>
                        )}
                        {appointment.hasAttachedDocuments && (
                            <div className="flex items-center space-x-2">
                                <FileText size={14} className="text-green-600 sm:w-4 sm:h-4 flex-shrink-0" />
                                <Text className="text-xs sm:text-sm text-green-600">
                                    {appointment.attachedDocuments.length} document(s)
                                </Text>
                            </div>
                        )}
                    </div>
                </div>

                {/* Reason for Visit */}
                {appointment.reasonForVisit && (
                    <div className="bg-green-50 p-2 sm:p-3 rounded-lg border border-green-100">
                        <Text strong className="text-green-800 text-xs sm:text-sm">
                            Reason for Visit:
                        </Text>
                        <br />
                        <Text className="text-green-700 text-xs sm:text-sm line-clamp-2 sm:line-clamp-3">
                            {appointment.reasonForVisit}
                        </Text>
                    </div>
                )}

                {/* Doctor's Notes (if available) */}
                {appointment.doctorNotes && (
                    <div className="bg-blue-50 p-2 sm:p-3 rounded-lg border border-blue-100">
                        <Text strong className="text-blue-800 text-xs sm:text-sm">
                            Doctor&apos;s Notes:
                        </Text>
                        <br />
                        <Text className="text-blue-700 text-xs sm:text-sm line-clamp-2 sm:line-clamp-3">
                            {appointment.doctorNotes}
                        </Text>
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 pt-2 border-t border-gray-100">
                    <div className="text-xs text-gray-500">
                        Created: {parseLocalDateTime(appointment.createdAt).format("MMM DD, YYYY")}
                    </div>
                    <Space size="small" className="w-full sm:w-auto">
                        <Button
                            type="primary"
                            size={isMobile ? "small" : "large"}
                            icon={<Eye className={isMobile ? "w-4 h-4" : "w-5 h-5"} />}
                            onClick={() => onView(appointment)}
                            className={`bg-green-600 border-green-600 hover:bg-green-700 hover:border-green-700 ${isMobile ? "text-xs px-2 py-1" : "text-base px-4 py-2"
                                } flex-1 sm:flex-none`}
                        >
                            <span className="hidden sm:inline">View Details</span>
                            <span className="sm:hidden">View</span>
                        </Button>
                        {appointment.status === "PENDING" && onCancel && (
                            <Button
                                type="primary"
                                danger
                                size={isMobile ? "small" : "large"}
                                icon={<Trash2 className={isMobile ? "w-4 h-4" : "w-5 h-5"} />}
                                onClick={() => onCancel(appointment)}
                                className={`${isMobile ? "text-xs px-2 py-1" : "text-base px-4 py-2"
                                    } flex-1 sm:flex-none`}
                            >
                                <span className="hidden sm:inline">Cancel</span>
                                <span className="sm:hidden">Cancel</span>
                            </Button>
                        )}
                    </Space>
                </div>
            </div>
        </Card>
    );
};
