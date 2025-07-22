"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Card,
    Row,
    Col,
    Button,
    Typography,
    Tag,
    Spin,
    Alert,
    Divider,
    message,
    Image,
    Modal,
    Input,
    Popconfirm,
} from "antd";
import {
    FileText,
    Calendar,
    User,
    Stethoscope,
    Pill,
    Clock,
    AlertTriangle,
    CheckCircle,
    Package,
    Truck,
    CreditCard,
    ArrowLeft,
    X
} from "lucide-react";

import PrescriptionApi from "@/app/api/prescription";
import DeliveryApi from "@/app/api/delivery";
import { PrescriptionDto, PrescriptionStatus } from "@/app/api/prescription/props";
import { DeliveryStatus } from "@/app/api/delivery/props";
import PaymentModal from "@/app/components/PaymentModal/PaymentModal";
import dayjs from "dayjs";
import MedicationCard from "../components/MedicationCard";

const { Title, Text } = Typography;
const { TextArea } = Input;

const PrescriptionDetailPage = () => {
    const params = useParams();
    const router = useRouter();
    const prescriptionId = params.id as string;

    // State management
    const [prescription, setPrescription] = useState<PrescriptionDto | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Modal states
    const [paymentModalVisible, setPaymentModalVisible] = useState<boolean>(false);
    const [cancellationModalVisible, setCancellationModalVisible] = useState<boolean>(false);
    const [cancellationReason, setCancellationReason] = useState<string>("");
    const [isCancellingDelivery, setIsCancellingDelivery] = useState<boolean>(false);
    const [deliveryCancellable, setDeliveryCancellable] = useState<boolean>(false);

    // Fetch prescription details
    const fetchPrescriptionDetails = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await PrescriptionApi.getPrescriptionById(prescriptionId);
            if (response.data.isSuccess && response.data.data) {
                setPrescription(response.data.data);

                // Note: delivery field now contains the latest delivery due to OneToMany relationship
                // Check if delivery is cancellable if it exists
                const delivery = response.data.data.delivery;
                if (delivery && delivery.deliveryMethod === "HOME_DELIVERY") {
                    try {
                        const cancellableResponse = await DeliveryApi.isDeliveryCancellableByPatient(delivery.id);
                        setDeliveryCancellable(cancellableResponse.data.data || false);
                    } catch {
                        setDeliveryCancellable(false);
                    }
                } else {
                    setDeliveryCancellable(false);
                }
            } else {
                throw new Error("Failed to fetch prescription details");
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || "Failed to load prescription";
            setError(errorMessage);
            message.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (prescriptionId) {
            fetchPrescriptionDetails();
        }
    }, [prescriptionId]);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    // Handle delivery flow navigation
    const handleChooseDeliveryMethod = () => {
        if (!prescription) {
            message.error("Prescription data not found");
            return;
        }

        // Navigate to delivery flow page
        router.push(`/patient/prescription/${prescriptionId}/delivery`);
    };

    // Payment handlers
    const handlePayDelivery = () => {
        setPaymentModalVisible(true);
    };

    const handlePaymentSuccess = async () => {
        setPaymentModalVisible(false);
        message.success("Payment completed successfully!");
        await fetchPrescriptionDetails();
    };

    // Delivery completion handler
    const handleMarkDelivered = async () => {
        const delivery = prescription?.delivery;
        if (!delivery) return;

        try {
            await DeliveryApi.markAsCompleted(delivery.id);
            message.success("Delivery marked as completed!");
            await fetchPrescriptionDetails();
        } catch (error: any) {
            message.error(error.response?.data?.message || "Failed to mark delivery as completed");
        }
    };

    // Delivery cancellation handler
    const handleCancelDelivery = async () => {
        const delivery = prescription?.delivery;
        if (!delivery) return;

        if (!cancellationReason.trim()) {
            message.error("Please provide a cancellation reason.");
            return;
        }

        try {
            setIsCancellingDelivery(true);
            await DeliveryApi.cancelDeliveryByPatient({
                deliveryId: delivery.id,
                reason: cancellationReason.trim()
            });
            message.success("Delivery cancelled successfully!");
            setCancellationModalVisible(false);
            setCancellationReason("");
            await fetchPrescriptionDetails();
        } catch (error: any) {
            message.error(error.response?.data?.message || "Failed to cancel delivery");
        } finally {
            setIsCancellingDelivery(false);
        }
    };

    // Helper functions for delivery information display
    const getDeliveryStatusColor = (status: string) => {
        switch (status) {
            case "PENDING_PAYMENT":
                return "orange";
            case "PAID":
                return "blue";
            case "PREPARING":
                return "purple";
            case "READY_FOR_PICKUP":
                return "green";
            case "OUT_FOR_DELIVERY":
                return "cyan";
            case "DELIVERED":
                return "green";
            case "CANCELLED":
                return "red";
            default:
                return "default";
        }
    };

    const formatDeliveryStatus = (status: string) => {
        switch (status) {
            case "PENDING_PAYMENT":
                return "Pending Payment";
            case "PAID":
                return "Payment Completed";
            case "PREPARING":
                return "Preparing";
            case "READY_FOR_PICKUP":
                return "Ready for Pickup";
            case "OUT_FOR_DELIVERY":
                return "Out for Delivery";
            case "DELIVERED":
                return "Delivered";
            case "CANCELLED":
                return "Cancelled";
            default:
                return status.replace(/_/g, " ");
        }
    };



    // Get status configuration
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
                return { color: "red", text: "Cancelled", icon: <AlertTriangle className="w-4 h-4" /> };
            default:
                return { color: "default", text: status, icon: <FileText className="w-4 h-4" /> };
        }
    };

    // Format dates
    const formatDate = (dateString: string) => {
        return dayjs(dateString).format("MMM DD, YYYY");
    };

    const formatDateTime = (dateString: string) => {
        return dayjs(dateString).format("MMM DD, YYYY [at] h:mm A");
    };



    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-6">
                <div className="flex justify-center items-center py-12">
                    <Spin size="large" />
                </div>
            </div>
        );
    }

    if (error || !prescription) {
        return (
            <div className="container mx-auto px-4 py-6">
                <Button
                    type="text"
                    icon={<ArrowLeft className="w-4 h-4" />}
                    onClick={() => router.push("/patient/prescription")}
                    className="mb-4 px-0"
                >
                    Back to Prescriptions
                </Button>
                <Alert
                    message="Error Loading Prescription"
                    description={error || "Prescription not found"}
                    type="error"
                    showIcon
                    className="mt-4"
                    action={
                        <Button size="middle" danger onClick={fetchPrescriptionDetails}>
                            Retry
                        </Button>
                    }
                />
            </div>
        );
    }

    const statusConfig = getStatusConfig(prescription.status);
    const delivery = prescription?.delivery;
    const isActionRequired = prescription.status === PrescriptionStatus.CREATED && (!delivery || delivery.status === DeliveryStatus.CANCELLED);

    return (
        <div className="container mx-auto">
            <Button
                type="text"
                icon={<ArrowLeft className="w-4 h-4" />}
                onClick={() => router.push("/patient/prescription")}
                className="px-0"
            >
                Back to Prescriptions
            </Button>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6">
                <div className="mb-3 sm:mb-0">
                    <Title level={2} className="mb-2 text-lg sm:text-xl lg:text-2xl">
                        {prescription.prescriptionNumber}
                    </Title>
                    <div className="flex flex-wrap gap-2">
                        <Tag
                            color={statusConfig.color}
                            className="px-2 py-1 sm:px-3"
                        >
                            <div className="flex gap-1 justify-center items-center">
                                {statusConfig.icon}
                                {statusConfig.text}
                            </div>
                        </Tag>
                        {isActionRequired && (
                            <Tag color="orange" className="px-2 py-1 sm:px-3">
                                Action Required
                            </Tag>
                        )}
                    </div>
                </div>
            </div>

            {/* Action Required Alert */}
            {isActionRequired && (
                <Alert
                    message="Action Required"
                    description="Please choose how you'd like to receive your prescription - pickup at pharmacy or home delivery."
                    type="warning"
                    showIcon
                    className="mb-4 sm:mb-6"
                />
            )}

            <Row gutter={[16, 16]} className="sm:gutter-x-6">
                {/* Left Column - Prescription Details */}
                <Col xs={24} lg={16} className="order-1 lg:order-1">
                    {/* Basic Information */}
                    <Card className="mb-4 sm:mb-6" title="Prescription Information">
                        <Row gutter={[12, 16]} className="sm:gutter-x-4">
                            <Col xs={24} sm={12}>
                                <div className="space-y-3">
                                    <div className="flex items-start sm:items-center space-x-2">
                                        <Stethoscope className="w-4 h-4 text-gray-500 mt-0.5 sm:mt-0 flex-shrink-0" />
                                        <Text className="text-gray-700 text-sm sm:text-base">
                                            <strong>Doctor:</strong> Dr. {prescription.appointment.doctor.name}
                                        </Text>
                                    </div>
                                    <div className="flex items-start sm:items-center space-x-2">
                                        <User className="w-4 h-4 text-gray-500 mt-0.5 sm:mt-0 flex-shrink-0" />
                                        <Text className="text-gray-700 text-sm sm:text-base">
                                            <strong>Patient:</strong> {prescription.appointment.patient.name}
                                        </Text>
                                    </div>
                                    <div className="flex items-start sm:items-center space-x-2">
                                        <Calendar className="w-4 h-4 text-gray-500 mt-0.5 sm:mt-0 flex-shrink-0" />
                                        <Text className="text-gray-700 text-sm sm:text-base">
                                            <strong>Appointment:</strong> {formatDateTime(prescription.appointment.appointmentDateTime)}
                                        </Text>
                                    </div>
                                </div>
                            </Col>
                            <Col xs={24} sm={12}>
                                <div className="space-y-3">
                                    <div>
                                        <Text className="text-gray-700 text-sm sm:text-base">
                                            <strong>Diagnosis:</strong> {prescription.diagnosis}
                                        </Text>
                                    </div>
                                    <div>
                                        <Text className="text-gray-700 text-sm sm:text-base">
                                            <strong>Created:</strong> {dayjs(Number(prescription.createdAt) * 1000).format("MMM DD, YYYY")}
                                        </Text>
                                    </div>
                                    <div>
                                        <Text className="text-gray-700 text-sm sm:text-base">
                                            <strong>Expires:</strong> {dayjs(Number(prescription.expiryDate) * 1000).format("MMM DD, YYYY")}
                                        </Text>
                                    </div>
                                </div>
                            </Col>
                        </Row>

                        {prescription.notes && (
                            <>
                                <Divider />
                                <div>
                                    <Text className="text-gray-700 text-sm sm:text-base">
                                        <strong>Notes:</strong> {prescription.notes}
                                    </Text>
                                </div>
                            </>
                        )}

                        <Divider />
                        <div>
                            <Text className="text-gray-700 text-sm sm:text-base">
                                <strong>Instructions:</strong> {prescription.instructions}
                            </Text>
                        </div>
                    </Card>

                    {/* Medications */}
                    <Card
                        title={`Medications (${prescription.prescriptionItems.length})`}
                        className="mb-4 sm:mb-6"
                    >
                        <div className="space-y-2">
                            {prescription.prescriptionItems.map((medication, index) => (
                                <MedicationCard
                                    key={medication.id || index}
                                    medication={medication}
                                />
                            ))}
                        </div>
                    </Card>
                </Col>

                {/* Right Column - Delivery Information */}
                <Col xs={24} lg={8} className="order-2 lg:order-2">
                    {delivery && delivery.status !== DeliveryStatus.CANCELLED ? (
                        <Card title="Delivery Information" className="mb-4 sm:mb-6">
                            <div className="space-y-4">
                                {/* Delivery Method & Status */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                                    <div className="flex items-center space-x-2">
                                        {delivery.deliveryMethod === "PICKUP" ? (
                                            <Package className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
                                        ) : (
                                            <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
                                        )}
                                        <Text className="font-medium text-sm sm:text-base">
                                            {delivery.deliveryMethod === "PICKUP" ? "Pickup at Pharmacy" : "Home Delivery"}
                                        </Text>
                                    </div>
                                    <Tag color={getDeliveryStatusColor(delivery.status)} className="px-2 py-1 text-xs sm:text-sm self-start sm:self-auto">
                                        {formatDeliveryStatus(delivery.status)}
                                    </Tag>
                                </div>

                                {/* Delivery Status Details */}
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <Text className="text-gray-700 block mb-2">
                                        <strong>Current Status:</strong> {formatDeliveryStatus(delivery.status)}
                                    </Text>
                                    {delivery.status === "PENDING_PAYMENT" && (
                                        <Text className="text-orange-600 text-sm">
                                            Payment required to proceed with delivery
                                        </Text>
                                    )}
                                    {delivery.status === "PREPARING" && (
                                        <Text className="text-blue-600 text-sm">
                                            Pharmacy is preparing your medication
                                        </Text>
                                    )}
                                    {delivery.status === "OUT_FOR_DELIVERY" && (
                                        <Text className="text-purple-600 text-sm">
                                            Your medication is on the way
                                        </Text>
                                    )}
                                    {delivery.status === "READY_FOR_PICKUP" && (
                                        <Text className="text-blue-600 text-sm">
                                            Ready for pickup at pharmacy
                                        </Text>
                                    )}
                                    {delivery.status === "DELIVERED" && (
                                        <Text className="text-blue-600 text-sm">
                                            Medication has been delivered successfully
                                        </Text>
                                    )}
                                </div>

                                {/* Delivery Fee (for Home Delivery) */}
                                {delivery.deliveryMethod === "HOME_DELIVERY" && delivery.deliveryFee > 0 && (
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0 p-3 border border-gray-200 rounded-lg">
                                        <Text className="text-gray-700 text-sm sm:text-base">
                                            <strong>Delivery Fee:</strong>
                                        </Text>
                                        <Text className="text-base sm:text-lg font-semibold text-blue-600">
                                            RM {delivery.deliveryFee.toFixed(2)}
                                        </Text>
                                    </div>
                                )}

                                {/* Estimated/Actual Delivery Date */}
                                {delivery.estimatedDeliveryDate && (
                                    <div>
                                        <Text className="text-gray-700">
                                            <strong>
                                                {delivery.status === "DELIVERED" ? "Delivered On:" : "Estimated Delivery:"}
                                            </strong>{" "}
                                            {dayjs(Number(delivery.actualDeliveryDate || delivery.estimatedDeliveryDate) * 1000).format("MMM DD, YYYY")}
                                        </Text>
                                    </div>
                                )}

                                {/* Pickup Date (for Pickup Method) */}
                                {delivery.deliveryMethod === "PICKUP" && delivery.pickupDate && (
                                    <div>
                                        <Text className="text-gray-700">
                                            <strong>Available for Pickup:</strong> {formatDate(delivery.pickupDate)}
                                        </Text>
                                    </div>
                                )}

                                {/* Tracking Information (for Home Delivery) */}
                                {delivery.deliveryMethod === "HOME_DELIVERY" && delivery.trackingReference && (
                                    <div className="bg-blue-50 p-3 rounded-lg">
                                        <Text className="text-gray-700 block">
                                            <strong>Tracking Reference:</strong> {delivery.trackingReference}
                                        </Text>
                                        {delivery.courierName && (
                                            <Text className="text-gray-700 block mt-1">
                                                <strong>Courier:</strong> {delivery.courierName}
                                            </Text>
                                        )}
                                        {delivery.deliveryContactPhone && (
                                            <Text className="text-gray-700 block mt-1">
                                                <strong>Contact:</strong> {delivery.deliveryContactPhone}
                                            </Text>
                                        )}
                                    </div>
                                )}

                                {/* Delivery Instructions */}
                                {delivery.deliveryInstructions && (
                                    <div>
                                        <Text className="text-gray-700">
                                            <strong>Delivery Instructions:</strong>
                                        </Text>
                                        <div className="mt-1 p-2 bg-gray-50 rounded text-sm text-gray-600">
                                            {delivery.deliveryInstructions}
                                        </div>
                                    </div>
                                )}

                                {/* Delivery Notes */}
                                {delivery.deliveryNotes && (
                                    <div>
                                        <Text className="text-gray-700">
                                            <strong>Delivery Notes:</strong>
                                        </Text>
                                        <div className="mt-1 p-2 bg-gray-50 rounded text-sm text-gray-600">
                                            {delivery.deliveryNotes}
                                        </div>
                                    </div>
                                )}

                                {/* Cancellation Info */}
                                {(delivery.status as string) === "CANCELLED" && delivery.cancellationReason && (
                                    <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                                        <Text className="text-red-800">
                                            <strong>Cancellation Reason:</strong>
                                        </Text>
                                        <Text className="text-red-700 text-sm mt-1">
                                            {delivery.cancellationReason}
                                        </Text>
                                    </div>
                                )}

                                {/* Delivery Timeline */}
                                <div className="pt-2 border-t border-gray-200">
                                    <Text className="text-gray-700 text-sm">
                                        <strong>Created:</strong> {dayjs(Number(delivery.createdAt) * 1000).format("MMM DD, YYYY")}
                                    </Text>
                                    {delivery.updatedAt !== delivery.createdAt && (
                                        <Text className="text-gray-700 text-sm block mt-1">
                                            <strong>Last Updated:</strong> {dayjs(Number(delivery.updatedAt) * 1000).format("MMM DD, YYYY")}
                                        </Text>
                                    )}
                                </div>

                                {delivery.deliveryMethod === "HOME_DELIVERY" && (
                                    <div>
                                        <Text className="text-gray-700">
                                            <strong>Delivery Fee:</strong> RM {delivery.deliveryFee.toFixed(2)}
                                        </Text>
                                    </div>
                                )}

                                {delivery.trackingReference && (
                                    <div>
                                        <Text className="text-gray-700">
                                            <strong>Tracking:</strong> {delivery.trackingReference}
                                        </Text>
                                    </div>
                                )}

                                {delivery.deliveryInstructions && (
                                    <div>
                                        <Text className="text-gray-700">
                                            <strong>Instructions:</strong> {delivery.deliveryInstructions}
                                        </Text>
                                    </div>
                                )}

                                {/* Payment Button for Delivery Fees */}
                                {delivery.deliveryFee !== null && delivery.deliveryFee !== undefined && delivery.deliveryFee > 0 && delivery.status === "PENDING_PAYMENT" && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <Button
                                            type="primary"
                                            block
                                            icon={<CreditCard className="w-4 h-4" />}
                                            onClick={handlePayDelivery}
                                            className="bg-green-600 hover:bg-green-700 border-green-600"
                                            size="middle"
                                        >
                                            <span className="hidden sm:inline">Pay Delivery Fee - RM {delivery.deliveryFee.toFixed(2)}</span>
                                            <span className="sm:hidden">Pay RM {delivery.deliveryFee.toFixed(2)}</span>
                                        </Button>
                                    </div>
                                )}

                                {/* Delivery Completion Button */}
                                {delivery.status === "OUT_FOR_DELIVERY" && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <Button
                                            type="primary"
                                            block
                                            icon={<CheckCircle className="w-4 h-4" />}
                                            onClick={handleMarkDelivered}
                                            className="bg-green-600 hover:bg-green-700 border-green-600"
                                            size="middle"
                                        >
                                            <span className="hidden sm:inline">Mark as Delivered</span>
                                            <span className="sm:hidden">Mark Delivered</span>
                                        </Button>
                                    </div>
                                )}

                                {/* Cancel Delivery Button (only for Home Delivery) */}
                                {deliveryCancellable && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <Popconfirm
                                            title="Are you sure you want to cancel this delivery?"
                                            description="This action cannot be undone."
                                            onConfirm={() => setCancellationModalVisible(true)}
                                            okText="Yes"
                                            cancelText="No"
                                        >
                                            <Button
                                                type="primary"
                                                block
                                                danger
                                                icon={<X className="w-4 h-4" />}
                                                className="bg-red-600 hover:bg-red-700 border-red-600"
                                                size="middle"
                                                loading={isCancellingDelivery}
                                            >
                                                <span className="hidden sm:inline">Cancel Delivery</span>
                                                <span className="sm:hidden">Cancel</span>
                                            </Button>
                                        </Popconfirm>
                                    </div>
                                )}
                            </div>
                        </Card>
                    ) : delivery && delivery.status === DeliveryStatus.CANCELLED ? (
                        <>
                            {/* Cancelled Delivery Information */}
                            <Card title="Previous Delivery - Cancelled" className="mb-4 sm:mb-6 border-red-200">
                                <div className="space-y-4">
                                    <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <X className="w-5 h-5 text-red-600" />
                                            <Text strong className="text-red-800">Delivery Cancelled</Text>
                                        </div>
                                        <Text className="text-red-700 text-sm">
                                            Your {delivery.deliveryMethod === "PICKUP" ? "pickup" : "home delivery"} order was cancelled.
                                        </Text>
                                        {delivery.cancellationReason && (
                                            <div className="mt-2">
                                                <Text className="text-red-700 text-xs">
                                                    <strong>Reason:</strong> {delivery.cancellationReason}
                                                </Text>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>

                            {/* Choose New Delivery Method */}
                            <Card title="Choose New Delivery Method" className="mb-4 sm:mb-6">
                                <div className="text-center space-y-4">
                                    <div className="text-gray-500 mb-4">
                                        <Package className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 text-gray-400" />
                                        <Text className="text-sm sm:text-base">Please choose how you&apos;d like to receive your prescription</Text>
                                    </div>
                                    <Button
                                        type="primary"
                                        block
                                        onClick={handleChooseDeliveryMethod}
                                        className="bg-green-600 hover:bg-green-700 border-green-600"
                                        size="middle"
                                    >
                                        <span className="hidden sm:inline">Choose New Delivery Method</span>
                                        <span className="sm:hidden">Choose Method</span>
                                    </Button>
                                </div>
                            </Card>
                        </>
                    ) : isActionRequired && (
                        <Card title="Delivery Method" className="mb-4 sm:mb-6">
                            <div className="text-center space-y-4">
                                <div className="text-gray-500 mb-4">
                                    <Package className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 text-gray-400" />
                                    <Text className="text-sm sm:text-base">Choose your delivery method</Text>
                                </div>
                                <Button
                                    type="primary"
                                    block
                                    onClick={handleChooseDeliveryMethod}
                                    className="bg-green-600 hover:bg-green-700 border-green-600"
                                    size="middle"
                                >
                                    <span className="hidden sm:inline">Choose Delivery Method</span>
                                    <span className="sm:hidden">Choose Method</span>
                                </Button>
                            </div>
                        </Card>
                    )}

                    {/* Pharmacy Information */}
                    {prescription.appointment.doctor && (
                        <Card title="Pharmacy Information" className="mb-4 sm:mb-6">
                            <div className="space-y-3">
                                {/* Facility Image */}
                                {prescription.appointment.doctor.facility?.thumbnailUrl && (
                                    <div className="flex justify-center">
                                        <Image
                                            src={prescription.appointment.doctor.facility.thumbnailUrl}
                                            alt={`${prescription.appointment.doctor.facility.name} facility`}
                                            className="rounded-lg"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                            }}
                                        />
                                    </div>
                                )}

                                <div>
                                    <Text className="text-gray-700 text-sm sm:text-base">
                                        <strong>Name:</strong> {prescription.appointment.doctor.facility?.name || "N/A"}
                                    </Text>
                                </div>

                                {prescription.appointment.doctor.facility?.address && (
                                    <div>
                                        <Text className="text-gray-700 text-sm sm:text-base">
                                            <strong>Address:</strong> {prescription.appointment.doctor.facility.address}
                                            {prescription.appointment.doctor.facility?.city && `, ${prescription.appointment.doctor.facility.city}`}
                                            {prescription.appointment.doctor.facility?.state && `, ${prescription.appointment.doctor.facility.state}`}
                                        </Text>
                                    </div>
                                )}

                                {prescription.appointment.doctor.facility?.telephone && (
                                    <div>
                                        <Text className="text-gray-700 text-sm sm:text-base">
                                            <strong>Phone:</strong> {prescription.appointment.doctor.facility.telephone}
                                        </Text>
                                    </div>
                                )}
                            </div>
                        </Card>
                    )}
                </Col>
            </Row>



            {/* Payment Modal */}
            {prescription && (
                <PaymentModal
                    visible={paymentModalVisible}
                    onClose={() => setPaymentModalVisible(false)}
                    context={{ type: "prescription", data: prescription }}
                    onPaymentSuccess={handlePaymentSuccess}
                />
            )}

            {/* Cancellation Modal */}
            {cancellationModalVisible && (
                <Modal
                    title="Cancel Delivery"
                    open={cancellationModalVisible}
                    onCancel={() => setCancellationModalVisible(false)}
                    onOk={handleCancelDelivery}
                    okText="Confirm Cancel"
                    cancelText="Back"
                    okButtonProps={{ danger: true, loading: isCancellingDelivery }}
                    cancelButtonProps={{ disabled: isCancellingDelivery }}
                >
                    <div className="space-y-4">
                        <Alert
                            message="Are you sure you want to cancel this delivery?"
                            description="If you have already paid for this delivery, any applicable refunds will be processed within 3-5 business days."
                            type="warning"
                            showIcon
                        />
                        <div>
                            <Text className="text-gray-700 block mb-2">
                                <strong>Please provide a reason for cancelling this delivery:</strong>
                            </Text>
                            <TextArea
                                rows={4}
                                placeholder="Enter cancellation reason (required)"
                                value={cancellationReason}
                                onChange={(e) => setCancellationReason(e.target.value)}
                                disabled={isCancellingDelivery}
                                maxLength={500}
                                showCount
                            />
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default PrescriptionDetailPage;
