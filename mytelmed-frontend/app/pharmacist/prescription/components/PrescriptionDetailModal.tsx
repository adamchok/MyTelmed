"use client";

import React, { useState } from "react";
import {
    Modal,
    Card,
    Typography,
    Tag,
    Button,
    Row,
    Col,
    message,
    Table,
    Popconfirm,
    Badge,
    Alert,
    Descriptions
} from "antd";
import {
    Pill,
    User,
    Calendar,
    Clock,
    FileText,
    Package,
    Play,
    CheckCircle,
    Truck,
    AlertTriangle
} from "lucide-react";
import { PrescriptionDto, PrescriptionStatus } from "@/app/api/prescription/props";
import { DeliveryStatus } from "@/app/api/delivery/props";
import PrescriptionApi from "@/app/api/prescription";
import DeliveryApi from "@/app/api/delivery";
import CourierDetailsModal from "./CourierDetailsModal";
import dayjs from "dayjs";

const { Text, Paragraph } = Typography;

interface PrescriptionDetailModalProps {
    visible: boolean;
    prescription: PrescriptionDto | null;
    onClose: () => void;
    onStatusUpdate: () => void;
}

export default function PrescriptionDetailModal({
    visible,
    prescription,
    onClose,
    onStatusUpdate
}: Readonly<PrescriptionDetailModalProps>) {
    const [loading, setLoading] = useState(false);
    const [courierModalVisible, setCourierModalVisible] = useState(false);



    const handleStartProcessing = async () => {
        if (!prescription) return;

        try {
            setLoading(true);
            await PrescriptionApi.startProcessing(prescription.id);
            message.success('Prescription processing started');
            onStatusUpdate();
            onClose();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Failed to start processing');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkReady = async () => {
        if (!prescription) return;

        try {
            setLoading(true);
            await PrescriptionApi.markAsReady(prescription.id);
            message.success('Prescription marked as ready');
            onStatusUpdate();

            // Backend will automatically update delivery status when prescription is marked as ready

            onClose();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Failed to mark as ready');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkOutForDelivery = () => {
        setCourierModalVisible(true);
    };

    const handleMarkReadyForPickup = async () => {
        const delivery = prescription?.delivery;
        if (!delivery) return;

        try {
            setLoading(true);
            await DeliveryApi.markReadyForPickup(delivery.id);
            message.success('Pickup marked as ready for pickup');
            onStatusUpdate();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Failed to mark as ready for pickup');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkDelivered = async () => {
        const delivery = prescription?.delivery;
        if (!delivery) return;

        try {
            setLoading(true);
            await DeliveryApi.markAsDelivered(delivery.id);
            message.success('Pickup marked as delivered');
            onStatusUpdate();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Failed to mark as delivered');
        } finally {
            setLoading(false);
        }
    };

    const handleCourierDetailsSubmit = async (courierDetails: {
        courierName: string;
        trackingReference: string;
        contactPhone?: string;
    }) => {
        const delivery = prescription?.delivery;
        if (!delivery) return;

        try {
            await DeliveryApi.markOutForDelivery({
                deliveryId: delivery.id,
                ...courierDetails
            });
            message.success('Prescription marked out for delivery');
            setCourierModalVisible(false);
            onStatusUpdate();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Failed to mark out for delivery');
        }
    };

    const getStatusColor = (status: PrescriptionStatus) => {
        switch (status) {
            case PrescriptionStatus.CREATED:
                return "orange";
            case PrescriptionStatus.READY_FOR_PROCESSING:
                return "blue";
            case PrescriptionStatus.PROCESSING:
                return "purple";
            case PrescriptionStatus.READY:
                return "green";
            case PrescriptionStatus.EXPIRED:
                return "red";
            case PrescriptionStatus.CANCELLED:
                return "default";
            default:
                return "default";
        }
    };

    const getDeliveryStatusColor = (status: DeliveryStatus) => {
        switch (status) {
            case DeliveryStatus.PENDING_PAYMENT:
                return "orange";
            case DeliveryStatus.PENDING_PICKUP:
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

    const formatDate = (dateString: string | number) => {
        if (typeof dateString === "string") {
            return new Date(dateString).toLocaleDateString('en-MY', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }

        return dayjs(Number(dateString) * 1000).format("MMM DD, YYYY HH:mm");
    };

    const medicationColumns = [
        {
            title: 'Medication',
            key: 'medication',
            render: (item: any) => (
                <div>
                    <Text strong>{item.medicationName}</Text>
                    {item.genericName && (
                        <div><Text className="text-gray-500 text-sm">({item.genericName})</Text></div>
                    )}
                </div>
            ),
        },
        {
            title: 'Form & Strength',
            key: 'form',
            render: (item: any) => (
                <div>
                    <div>{item.dosageForm}</div>
                    <Text className="text-gray-600">{item.strength}</Text>
                </div>
            ),
        },
        {
            title: 'Quantity',
            dataIndex: 'quantity',
            key: 'quantity',
            align: 'center' as const,
            render: (quantity: number) => (
                <Badge count={quantity} color="purple" />
            ),
        },
        {
            title: 'Instructions',
            key: 'instructions',
            render: (item: any) => (
                <div className="max-w-xs">
                    <div className="text-sm">{item.frequency}</div>
                    <div className="text-sm text-gray-600">{item.duration}</div>
                    <Paragraph
                        ellipsis={{ rows: 2, expandable: true }}
                        className="text-xs text-gray-500 mt-1"
                    >
                        {item.instructions}
                    </Paragraph>
                </div>
            ),
        },
    ];

    if (!prescription) return null;

    const delivery = prescription?.delivery;
    const canStartProcessing = prescription?.status === PrescriptionStatus.READY_FOR_PROCESSING;
    const canMarkReady = prescription?.status === PrescriptionStatus.PROCESSING;
    const canMarkOutForDelivery = delivery &&
        delivery.status === DeliveryStatus.PREPARING &&
        delivery.deliveryMethod !== "PICKUP" &&
        prescription?.status === PrescriptionStatus.READY;

    const canMarkReadyForPickup = delivery &&
        delivery.status === DeliveryStatus.PREPARING &&
        delivery.deliveryMethod === "PICKUP" &&
        prescription?.status === PrescriptionStatus.READY;

    const canMarkDelivered = delivery &&
        delivery.status === DeliveryStatus.READY_FOR_PICKUP &&
        prescription?.status === PrescriptionStatus.READY;

    return (
        <>
            <Modal
                title={
                    <div className="flex items-center space-x-2">
                        <Pill className="w-5 h-5 text-purple-500" />
                        <span>Prescription Details</span>
                    </div>
                }
                open={visible}
                onCancel={onClose}
                width="60%"
                style={{ maxWidth: 1200 }}
                footer={null}
                className="prescription-detail-modal"
                centered
            >
                <div className="space-y-6">
                    {/* Header Information */}
                    <Card>
                        <Row gutter={[24, 16]}>
                            <Col xs={24} md={12}>
                                <Descriptions column={1} size="small">
                                    <Descriptions.Item
                                        label={<span className="flex items-center"><Pill className="w-4 h-4 mr-1" /> Prescription Number</span>}
                                    >
                                        <Text strong className="text-purple-600">{prescription.prescriptionNumber}</Text>
                                    </Descriptions.Item>
                                    <Descriptions.Item
                                        label={<span className="flex items-center"><User className="w-4 h-4 mr-1" /> Patient</span>}
                                    >
                                        <Text strong>{prescription.appointment.patient.name}</Text>
                                    </Descriptions.Item>
                                    <Descriptions.Item
                                        label={<span className="flex items-center"><User className="w-4 h-4 mr-1" /> Doctor</span>}
                                    >
                                        <Text>{prescription.appointment.doctor.name}</Text>
                                    </Descriptions.Item>
                                </Descriptions>
                            </Col>
                            <Col xs={24} md={12}>
                                <Descriptions column={1} size="small">
                                    <Descriptions.Item
                                        label={<span className="flex items-center"><Calendar className="w-4 h-4 mr-1" /> Created</span>}
                                    >
                                        {formatDate(prescription.createdAt)}
                                    </Descriptions.Item>
                                    <Descriptions.Item
                                        label={<span className="flex items-center"><Clock className="w-4 h-4 mr-1" /> Expires</span>}
                                    >
                                        <Text className={new Date(prescription.expiryDate) < new Date() ? 'text-red-500' : ''}>
                                            {formatDate(prescription.expiryDate)}
                                        </Text>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Status">
                                        <Tag color={getStatusColor(prescription.status)} className="px-3 py-1">
                                            {prescription.status.replace(/_/g, ' ')}
                                        </Tag>
                                    </Descriptions.Item>
                                </Descriptions>
                            </Col>
                        </Row>

                        {prescription.pharmacist && (
                            <Alert
                                message={`Assigned to: ${prescription.pharmacist.name}`}
                                type="info"
                                icon={<User className="w-4 h-4" />}
                                className="mt-4"
                            />
                        )}
                    </Card>

                    {/* Delivery Information */}
                    {delivery && (
                        <Card
                            title={
                                <span className="flex items-center">
                                    <Truck className="w-4 h-4 mr-2" />
                                    Delivery Information
                                </span>
                            }
                        >
                            <Row gutter={[24, 16]}>
                                <Col xs={24} md={12}>
                                    <Descriptions column={1} size="small">
                                        <Descriptions.Item label="Delivery Method">
                                            <Tag color="blue">{delivery.deliveryMethod.replace(/_/g, ' ')}</Tag>
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Status">
                                            <Tag color={getDeliveryStatusColor(delivery.status)}>
                                                {delivery.status.replace(/_/g, ' ')}
                                            </Tag>
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Delivery Fee">
                                            RM {delivery.deliveryFee.toFixed(2)}
                                        </Descriptions.Item>
                                    </Descriptions>
                                </Col>
                                <Col xs={24} md={12}>
                                    {delivery.courierName && (
                                        <Descriptions column={1} size="small">
                                            <Descriptions.Item label="Courier">
                                                {delivery.courierName}
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Tracking">
                                                <Text copyable>{delivery.trackingReference}</Text>
                                            </Descriptions.Item>
                                            {delivery.deliveryContactPhone && (
                                                <Descriptions.Item label="Contact">
                                                    <Text copyable>{delivery.deliveryContactPhone}</Text>
                                                </Descriptions.Item>
                                            )}
                                        </Descriptions>
                                    )}
                                </Col>
                            </Row>

                            {delivery.deliveryInstructions && (
                                <div className="mt-4">
                                    <Text strong>Delivery Instructions:</Text>
                                    <Paragraph className="mt-1 text-gray-600">
                                        {delivery.deliveryInstructions}
                                    </Paragraph>
                                </div>
                            )}
                        </Card>
                    )}

                    {/* Diagnosis and Instructions */}
                    <Card>
                        <Row gutter={[24, 16]}>
                            <Col xs={24} md={12}>
                                <div>
                                    <Text strong className="flex items-center mb-2">
                                        <FileText className="w-4 h-4 mr-1" />
                                        Diagnosis
                                    </Text>
                                    <Paragraph className="text-gray-700 bg-gray-50 p-3 rounded">
                                        {prescription.diagnosis}
                                    </Paragraph>
                                </div>
                            </Col>
                            <Col xs={24} md={12}>
                                <div>
                                    <Text strong className="flex items-center mb-2">
                                        <AlertTriangle className="w-4 h-4 mr-1" />
                                        Instructions
                                    </Text>
                                    <Paragraph className="text-gray-700 bg-gray-50 p-3 rounded">
                                        {prescription.instructions}
                                    </Paragraph>
                                </div>
                            </Col>
                        </Row>

                        {prescription.notes && (
                            <div className="mt-4">
                                <Text strong>Additional Notes:</Text>
                                <Paragraph className="mt-1 text-gray-600 bg-yellow-50 p-3 rounded">
                                    {prescription.notes}
                                </Paragraph>
                            </div>
                        )}
                    </Card>

                    {/* Medications */}
                    <Card
                        title={
                            <span className="flex items-center">
                                <Package className="w-4 h-4 mr-2" />
                                Prescribed Medications ({prescription.prescriptionItems.length})
                            </span>
                        }
                    >
                        <Table
                            dataSource={prescription.prescriptionItems}
                            columns={medicationColumns}
                            rowKey="id"
                            pagination={false}
                            size="small"
                            scroll={{ x: 800 }}
                        />
                    </Card>

                    <div className="flex flex-wrap gap-3 justify-center">
                        {canStartProcessing && (
                            <Button
                                type="primary"
                                icon={<Play className="w-4 h-4" />}
                                onClick={handleStartProcessing}
                                loading={loading}
                                className="bg-purple-500 hover:bg-purple-600"
                            >
                                Start Processing
                            </Button>
                        )}

                        {canMarkReady && (
                            <Popconfirm
                                title="Mark Prescription as Ready"
                                description="Are you sure the prescription is ready for pickup/delivery?"
                                onConfirm={handleMarkReady}
                                okText="Yes, Mark Ready"
                                cancelText="Cancel"
                            >
                                <Button
                                    type="primary"
                                    icon={<CheckCircle className="w-4 h-4" />}
                                    loading={loading}
                                    className="bg-green-500 hover:bg-green-600"
                                >
                                    Mark as Ready
                                </Button>
                            </Popconfirm>
                        )}

                        {canMarkReadyForPickup && (
                            <Button
                                type="primary"
                                icon={<CheckCircle className="w-4 h-4" />}
                                onClick={handleMarkReadyForPickup}
                                loading={loading}
                                className="bg-green-500 hover:bg-green-600"
                            >
                                Mark Ready for Pickup
                            </Button>
                        )}

                        {canMarkOutForDelivery && (
                            <Button
                                type="primary"
                                icon={<Truck className="w-4 h-4" />}
                                onClick={handleMarkOutForDelivery}
                                className="bg-blue-500 hover:bg-blue-600"
                            >
                                Mark Out for Delivery
                            </Button>
                        )}

                        {canMarkDelivered && (
                            <Button
                                type="primary"
                                icon={<CheckCircle className="w-4 h-4" />}
                                onClick={handleMarkDelivered}
                                loading={loading}
                                className="bg-green-500 hover:bg-green-600"
                            >
                                Mark as Delivered
                            </Button>
                        )}
                    </div>
                </div>
            </Modal>

            {/* Courier Details Modal */}
            <CourierDetailsModal
                visible={courierModalVisible}
                onClose={() => setCourierModalVisible(false)}
                onSubmit={handleCourierDetailsSubmit}
            />
        </>
    );
}
