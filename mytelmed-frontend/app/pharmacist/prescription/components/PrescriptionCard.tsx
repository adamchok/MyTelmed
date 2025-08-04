"use client"

import { PrescriptionStatus, PrescriptionDto } from "@/app/api/prescription/props";
import { DeliveryStatus } from "@/app/api/delivery/props";
import { Button, Card, Dropdown, MenuProps, Typography, Tag, Avatar } from "antd";
import { MoreVertical, Pill, User, Calendar, Stethoscope, FileText, Clock, CheckCircle, AlertTriangle, XCircle, Package, Truck } from "lucide-react";
import dayjs from "dayjs";

const { Text, Title } = Typography;

interface PrescriptionCardProps {
    prescription: PrescriptionDto;
    onPrescriptionClick: (prescription: PrescriptionDto) => void;
    onQuickAction: (key: string, prescription: PrescriptionDto) => void;
    getQuickActions: (prescription: PrescriptionDto) => MenuProps['items'];
    formatDate: (dateString: string) => string;
}

export default function PrescriptionCard({
    prescription,
    onPrescriptionClick,
    onQuickAction,
    getQuickActions,
}: Readonly<PrescriptionCardProps>) {
    // Get status configuration matching patient card
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

    // Get delivery status configuration
    const getDeliveryStatusConfig = (status: DeliveryStatus) => {
        switch (status) {
            case DeliveryStatus.PENDING_PAYMENT:
                return { color: "orange", text: "Payment Pending" };
            case DeliveryStatus.PAID:
                return { color: "blue", text: "Paid" };
            case DeliveryStatus.PREPARING:
                return { color: "purple", text: "Preparing" };
            case DeliveryStatus.PENDING_PICKUP:
                return { color: "orange", text: "Pending Pickup" };
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
            className="w-full h-full shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200 cursor-pointer"
            styles={{ body: { padding: "20px" } }}
            onClick={() => onPrescriptionClick(prescription)}
        >
            {/* Header */}
            <div className="flex-col items-center justify-between mb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Avatar
                            size="large"
                            className="bg-purple-100 text-purple-600"
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
                    <Dropdown
                        menu={{
                            items: getQuickActions(prescription),
                            onClick: ({ key, domEvent }) => {
                                domEvent?.stopPropagation();
                                onQuickAction(key, prescription);
                            }
                        }}
                        trigger={['click']}
                        placement="bottomRight"
                    >
                        <Button
                            type="text"
                            size="small"
                            icon={<MoreVertical className="w-4 h-4" />}
                            className="text-gray-500 hover:text-purple-500"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </Dropdown>
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

            {/* Patient Info */}
            <div className="flex items-center space-x-2 mb-3 p-2 bg-gray-50 rounded-lg">
                <User className="w-4 h-4 text-gray-500" />
                <Text className="text-gray-700 font-medium">
                    {prescription.appointment.patient.name}
                </Text>
            </div>

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
                        {dayjs(Number(prescription.createdAt) * 1000).format("MMM DD, YYYY HH:mm")}
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

            <div className="flex flex-col gap-2 md:flex-row md:gap-4 mb-4">
                {/* Created Date */}
                <Text className="text-gray-600 text-sm">
                    Created: {dayjs(Number(prescription.createdAt) * 1000).format("MMM DD, YYYY")}
                </Text>

                {/* Expiry Date */}
                <Text className="text-gray-600 text-sm">
                    Expires: {dayjs(Number(prescription.expiryDate) * 1000).format("MMM DD, YYYY")}
                </Text>
            </div>

            {/* Delivery Status */}
            {prescription.delivery && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            {prescription.delivery.deliveryMethod === "PICKUP" ? (
                                <Package className="w-4 h-4 text-blue-500" />
                            ) : (
                                <Truck className="w-4 h-4 text-green-500" />
                            )}
                            <Text className="text-gray-700 font-medium text-sm">
                                {prescription.delivery.deliveryMethod === "PICKUP" ? "Pickup" : "Home Delivery"}
                            </Text>
                        </div>
                        <Tag
                            color={getDeliveryStatusConfig(prescription.delivery.status).color}
                            className="px-2 py-1 text-xs"
                        >
                            {getDeliveryStatusConfig(prescription.delivery.status).text}
                        </Tag>
                    </div>
                </div>
            )}

            {/* Pharmacist Assignment */}
            <div className="flex justify-between items-center">
                {prescription.pharmacist && (
                    <Text className="text-purple-600 text-sm">
                        Assigned to: {prescription.pharmacist.name}
                    </Text>
                )}
            </div>
        </Card>
    );
};