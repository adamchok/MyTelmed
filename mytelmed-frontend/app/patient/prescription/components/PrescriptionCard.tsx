"use client";

import { Card, Tag, Button, Typography, Avatar, Tooltip } from "antd";
import {
    FileText,
    Calendar,
    User,
    Stethoscope,
    Eye,
    Clock,
    Pill,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Package,
    Truck
} from "lucide-react";
import dayjs from "dayjs";
import { PrescriptionDto, PrescriptionStatus } from "@/app/api/prescription/props";
import { MedicationDeliverySimpleDto, DeliveryStatus } from "@/app/api/delivery/props";

const { Text, Title } = Typography;

interface PrescriptionCardProps {
    prescription: PrescriptionDto;
    delivery?: MedicationDeliverySimpleDto | null;
    showPatientInfo?: boolean;
    onViewDetails: (prescription: PrescriptionDto) => void;
}

const PrescriptionCard: React.FC<PrescriptionCardProps> = ({
    prescription,
    delivery,
    showPatientInfo = false,
    onViewDetails
}) => {
    // Get status color and icon
    const getStatusConfig = (status: PrescriptionStatus) => {
        switch (status) {
            case PrescriptionStatus.CREATED:
                return { color: "blue", text: "Created", icon: <FileText className="w-4 h-4" /> };
            case PrescriptionStatus.READY_FOR_PROCESSING:
                return { color: "orange", text: "Ready for Processing", icon: <Clock className="w-4 h-4" /> };
            case PrescriptionStatus.PROCESSING:
                return { color: "purple", text: "Processing", icon: <Pill className="w-4 h-4" /> };
            case PrescriptionStatus.READY:
                return { color: "green", text: "Ready", icon: <CheckCircle className="w-4 h-4" /> };
            case PrescriptionStatus.EXPIRED:
                return { color: "red", text: "Expired", icon: <AlertTriangle className="w-4 h-4" /> };
            case PrescriptionStatus.CANCELLED:
                return { color: "red", text: "Cancelled", icon: <XCircle className="w-4 h-4" /> };
            default:
                return { color: "default", text: status, icon: <FileText className="w-4 h-4" /> };
        }
    };

    const statusConfig = getStatusConfig(prescription.status);

    // Check if prescription is actionable (patient can choose delivery method)
    const isActionable = prescription.status === PrescriptionStatus.CREATED;

    const formatDate = (dateString: string) => {
        return dayjs(dateString).format("MMM DD, YYYY");
    };

    const formatTime = (dateString: string) => {
        return dayjs(dateString).format("h:mm A");
    };

    // Get delivery status config
    const getDeliveryStatusConfig = (status: DeliveryStatus) => {
        switch (status) {
            case DeliveryStatus.PENDING_PAYMENT:
                return { color: "orange", text: "Payment Pending" };
            case DeliveryStatus.PAID:
                return { color: "blue", text: "Paid" };
            case DeliveryStatus.PENDING_PICKUP:
                return { color: "orange", text: "Pending Pickup" };
            case DeliveryStatus.PREPARING:
                return { color: "purple", text: "Preparing" };
            case DeliveryStatus.READY_FOR_PICKUP:
                return { color: "green", text: "Ready for Pickup" };
            case DeliveryStatus.OUT_FOR_DELIVERY:
                return { color: "cyan", text: "Out for Delivery" };
            case DeliveryStatus.DELIVERED:
                return { color: "green", text: "Delivered" };
            case DeliveryStatus.CANCELLED:
                return { color: "red", text: "Cancelled" };
            default:
                return { color: "default", text: status };
        }
    };

    return (
        <Card
            className="w-full h-full shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200 flex flex-col"
            styles={{ body: { padding: "20px", display: "flex", flexDirection: "column", height: "100%" } }}
        >
            {/* Content Area */}
            <div className="flex-1">
                {/* Header */}
                <div className="flex-col items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <Avatar
                            size="large"
                            className="bg-blue-100 text-blue-600"
                            icon={<FileText className="w-5 h-5" />}
                        />
                        <div>
                            <Title level={5} className="mb-1 mt-0 text-gray-800">
                                {prescription.prescriptionNumber}
                            </Title>
                            <Text className="text-gray-500 text-sm">
                                {prescription.diagnosis}
                            </Text>
                        </div>
                    </div>
                    <div className="mt-4">
                        <Tag
                            color={statusConfig.color}
                            icon={statusConfig.icon}
                            className="px-3 py-1 flex gap-1 items-center w-fit"
                        >
                            {statusConfig.text}
                        </Tag>
                    </div>
                </div>

                {/* Patient Info (if needed for family members) */}
                {showPatientInfo && (
                    <div className="flex items-center space-x-2 mb-3 p-2 bg-gray-50 rounded-lg">
                        <User className="w-4 h-4 text-gray-500" />
                        <Text className="text-gray-700 font-medium">
                            {prescription.appointment.patient.name}
                        </Text>
                    </div>
                )}

                {/* Appointment Info */}
                <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2">
                        <Stethoscope className="w-4 h-4 text-gray-500" />
                        <Text className="text-gray-700">
                            Dr. {prescription.appointment.doctor.name}
                        </Text>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <Text className="text-gray-700">
                            {formatDate(prescription.appointment.appointmentDateTime)} at {formatTime(prescription.appointment.appointmentDateTime)}
                        </Text>
                    </div>
                </div>

                {/* Medication Count */}
                <div className="mb-4">
                    <Text className="text-gray-600">
                        <Pill className="w-4 h-4 inline mr-1" />
                        {prescription.prescriptionItems.length} medication{prescription.prescriptionItems.length !== 1 ? 's' : ''}
                    </Text>
                </div>

                {/* Expiry Date */}
                <div className="mb-4">
                    <Text className="text-gray-600 text-sm">
                        Expires: {dayjs(Number(prescription.expiryDate) * 1000).format("MMM DD, YYYY")}
                    </Text>
                </div>

                {/* Delivery Status */}
                {delivery && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between flex-wrap">
                            <div className="flex items-center space-x-2">
                                {delivery.deliveryMethod === "PICKUP" ? (
                                    <Package className="w-4 h-4 text-blue-500" />
                                ) : (
                                    <Truck className="w-4 h-4 text-green-500" />
                                )}
                                <Text className="text-gray-700 font-medium text-sm">
                                    {delivery.deliveryMethod === "PICKUP" ? "Pickup" : "Home Delivery"}
                                </Text>
                            </div>
                            <Tag
                                color={getDeliveryStatusConfig(delivery.status).color}
                                className="px-2 py-1 text-xs"
                            >
                                {getDeliveryStatusConfig(delivery.status).text}
                            </Tag>
                        </div>
                    </div>
                )}
            </div>

            {/* Actions - Pushed to bottom */}
            <div className="border-t border-gray-100">
                <div className="flex flex-col xl:flex-row xl:justify-end lg:items-center gap-3 xl:gap-0">
                    <div className="flex space-x-2">
                        {isActionable && (
                            <Tooltip title="This prescription needs your action - choose delivery method">
                                <Tag color="orange" className="px-2 py-1">
                                    Action Required
                                </Tag>
                            </Tooltip>
                        )}
                    </div>

                    <Button
                        type="primary"
                        icon={<Eye className="w-4 h-4" />}
                        onClick={() => onViewDetails(prescription)}
                        className="bg-green-600 hover:bg-green-700 border-green-600 w-full sm:w-auto"
                    >
                        View Details
                    </Button>
                </div>
            </div>
        </Card>
    );
};

export default PrescriptionCard;
