"use client";

import React from "react";
import {
    Modal,
    Card,
    Typography,
    Row,
    Col,
    Tag,
    Space,
    List,
    Badge,
} from "antd";
import {
    User,
    Calendar,
    FileText,
    Pill,
    Building,
    Stethoscope,
} from "lucide-react";
import dayjs from "dayjs";
import { PrescriptionDto, PrescriptionStatus, PrescriptionItemDto } from "@/app/api/prescription/props";

const { Text, Paragraph } = Typography;

interface PrescriptionDetailModalProps {
    prescription: PrescriptionDto | null;
    visible: boolean;
    onCancel: () => void;
    onRefresh: () => void;
}

const PrescriptionDetailModal: React.FC<PrescriptionDetailModalProps> = ({
    prescription,
    visible,
    onCancel,
}) => {
    if (!prescription) {
        return null;
    }

    const getStatusColor = (status: PrescriptionStatus) => {
        switch (status) {
            case PrescriptionStatus.CREATED:
                return "blue";
            case PrescriptionStatus.READY_FOR_PROCESSING:
                return "orange";
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

    const getStatusText = (status: PrescriptionStatus) => {
        switch (status) {
            case PrescriptionStatus.CREATED:
                return "Created";
            case PrescriptionStatus.READY_FOR_PROCESSING:
                return "Ready for Processing";
            case PrescriptionStatus.PROCESSING:
                return "Processing";
            case PrescriptionStatus.READY:
                return "Ready";
            case PrescriptionStatus.EXPIRED:
                return "Expired";
            case PrescriptionStatus.CANCELLED:
                return "Cancelled";
            default:
                return status;
        }
    };

    return (
        <Modal
            title={
                <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span>Prescription Details</span>
                </div>
            }
            open={visible}
            onCancel={onCancel}
            footer={null}
            width={800}
            className="prescription-detail-modal"
        >
            <div className="space-y-6">
                {/* Header Information */}
                <Card className="bg-blue-50 border-blue-200">
                    <Row gutter={[24, 16]}>
                        <Col xs={24} sm={12}>
                            <Space direction="vertical" size={1}>
                                <Text className="text-sm text-gray-600">Prescription Number</Text>
                                <Text className="text-lg font-semibold text-blue-800">
                                    {prescription.prescriptionNumber}
                                </Text>
                            </Space>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Space direction="vertical" size={1}>
                                <Text className="text-sm text-gray-600">Status</Text>
                                <Tag
                                    color={getStatusColor(prescription.status)}
                                    className="text-sm px-3 py-1"
                                >
                                    {getStatusText(prescription.status)}
                                </Tag>
                            </Space>
                        </Col>
                    </Row>
                </Card>

                {/* Patient & Appointment Information */}
                <Card title={
                    <span className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Patient & Appointment Information
                    </span>
                }>
                    <Row gutter={[24, 16]}>
                        <Col xs={24} sm={12}>
                            <Space direction="vertical" size={1}>
                                <Text className="text-sm text-gray-600">Patient Name</Text>
                                <Text className="font-medium">
                                    {prescription.appointment.patient.name}
                                </Text>
                            </Space>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Space direction="vertical" size={1}>
                                <Text className="text-sm text-gray-600">Appointment Date</Text>
                                <Text className="font-medium">
                                    {dayjs(prescription.appointment.appointmentDateTime).format('MMMM D, YYYY [at] h:mm A')}
                                </Text>
                            </Space>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Space direction="vertical" size={1}>
                                <Text className="text-sm text-gray-600">Consultation Mode</Text>
                                <Badge
                                    status={prescription.appointment.consultationMode === 'VIRTUAL' ? 'processing' : 'success'}
                                    text={prescription.appointment.consultationMode === 'VIRTUAL' ? 'Virtual' : 'Physical'}
                                />
                            </Space>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Space direction="vertical" size={1}>
                                <Text className="text-sm text-gray-600">Doctor</Text>
                                <Text className="font-medium">
                                    Dr. {prescription.appointment.doctor.name}
                                </Text>
                            </Space>
                        </Col>
                    </Row>
                </Card>

                {/* Clinical Information */}
                <Card title={
                    <span className="flex items-center gap-2">
                        <Stethoscope className="w-4 h-4" />
                        Clinical Information
                    </span>
                }>
                    <Space direction="vertical" size={12} className="w-full">
                        <div>
                            <Text className="text-sm text-gray-600 block mb-2">Diagnosis</Text>
                            <Paragraph className="bg-gray-50 p-3 rounded mb-0">
                                {prescription.diagnosis}
                            </Paragraph>
                        </div>

                        <div>
                            <Text className="text-sm text-gray-600 block mb-2">General Instructions</Text>
                            <Paragraph className="bg-gray-50 p-3 rounded mb-0">
                                {prescription.instructions}
                            </Paragraph>
                        </div>

                        {prescription.notes && (
                            <div>
                                <Text className="text-sm text-gray-600 block mb-2">Additional Notes</Text>
                                <Paragraph className="bg-gray-50 p-3 rounded mb-0">
                                    {prescription.notes}
                                </Paragraph>
                            </div>
                        )}
                    </Space>
                </Card>

                {/* Medications */}
                <Card title={
                    <span className="flex items-center gap-2">
                        <Pill className="w-4 h-4" />
                        Prescribed Medications ({prescription.prescriptionItems?.length || 0} items)
                    </span>
                }>
                    {prescription.prescriptionItems && prescription.prescriptionItems.length > 0 ? (
                        <List
                            dataSource={prescription.prescriptionItems}
                            renderItem={(item: PrescriptionItemDto) => (
                                <List.Item className="border-b last:border-b-0 pb-4 last:pb-0">
                                    <div className="w-full">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex-1">
                                                <Text className="text-lg font-semibold text-blue-700">
                                                    {item.medicationName}
                                                </Text>
                                                {item.genericName && (
                                                    <Text className="text-sm text-gray-500 block">
                                                        Generic: {item.genericName}
                                                    </Text>
                                                )}
                                            </div>
                                            <Badge count={item.quantity} color="blue" />
                                        </div>

                                        <Row gutter={[16, 8]}>
                                            <Col xs={24} sm={12} md={6}>
                                                <div>
                                                    <Text className="text-xs text-gray-500 uppercase tracking-wide">Form</Text>
                                                    <div className="text-sm">{item.dosageForm}</div>
                                                </div>
                                            </Col>
                                            <Col xs={24} sm={12} md={6}>
                                                <div>
                                                    <Text className="text-xs text-gray-500 uppercase tracking-wide">Strength</Text>
                                                    <div className="text-sm">{item.strength}</div>
                                                </div>
                                            </Col>
                                            <Col xs={24} sm={12} md={6}>
                                                <div>
                                                    <Text className="text-xs text-gray-500 uppercase tracking-wide">Frequency</Text>
                                                    <div className="text-sm">{item.frequency}</div>
                                                </div>
                                            </Col>
                                            <Col xs={24} sm={12} md={6}>
                                                <div>
                                                    <Text className="text-xs text-gray-500 uppercase tracking-wide">Duration</Text>
                                                    <div className="text-sm">{item.duration}</div>
                                                </div>
                                            </Col>
                                        </Row>

                                        <div className="mt-3">
                                            <Text className="text-xs text-gray-500 uppercase tracking-wide">Instructions</Text>
                                            <div className="text-sm bg-gray-50 p-2 rounded mt-1">
                                                {item.instructions}
                                            </div>
                                        </div>

                                        {item.notes && (
                                            <div className="mt-2">
                                                <Text className="text-xs text-gray-500 uppercase tracking-wide">Notes</Text>
                                                <div className="text-sm text-gray-600 mt-1">
                                                    {item.notes}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </List.Item>
                            )}
                        />
                    ) : (
                        <div className="bg-gray-50 p-4 rounded text-center">
                            <Pill className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <Text className="text-gray-600">
                                No medications prescribed
                            </Text>
                        </div>
                    )}
                </Card>

                {/* Prescription Timeline */}
                <Card title={
                    <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Prescription Timeline
                    </span>
                }>
                    <Row gutter={[24, 16]}>
                        <Col xs={24} sm={8}>
                            <Space direction="vertical" size={1}>
                                <Text className="text-sm text-gray-600">Created</Text>
                                <Text className="font-medium">
                                    {dayjs(prescription.createdAt).format('MMM D, YYYY [at] h:mm A')}
                                </Text>
                            </Space>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Space direction="vertical" size={1}>
                                <Text className="text-sm text-gray-600">Last Updated</Text>
                                <Text className="font-medium">
                                    {dayjs(prescription.updatedAt).format('MMM D, YYYY [at] h:mm A')}
                                </Text>
                            </Space>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Space direction="vertical" size={1}>
                                <Text className="text-sm text-gray-600">Expires</Text>
                                <Text className={`font-medium ${(() => {
                                    if (dayjs(prescription.expiryDate).isBefore(dayjs())) return 'text-red-600';
                                    if (dayjs(prescription.expiryDate).diff(dayjs(), 'days') < 7) return 'text-orange-600';
                                    return 'text-green-600';
                                })()}`}>
                                    {dayjs(prescription.expiryDate).format('MMM D, YYYY')}
                                    {dayjs(prescription.expiryDate).isBefore(dayjs()) && ' (Expired)'}
                                </Text>
                            </Space>
                        </Col>
                    </Row>
                </Card>

                {/* Pharmacist Information (if assigned) */}
                {prescription.pharmacist && (
                    <Card title={
                        <span className="flex items-center gap-2">
                            <Building className="w-4 h-4" />
                            Pharmacy Information
                        </span>
                    }>
                        <Row gutter={[24, 16]}>
                            <Col xs={24} sm={12}>
                                <Space direction="vertical" size={1}>
                                    <Text className="text-sm text-gray-600">Pharmacist</Text>
                                    <Text className="font-medium">
                                        {prescription.pharmacist.name}
                                    </Text>
                                </Space>
                            </Col>
                            <Col xs={24} sm={12}>
                                <Space direction="vertical" size={1}>
                                    <Text className="text-sm text-gray-600">Facility</Text>
                                    <Text className="font-medium">
                                        {prescription.pharmacist.facility?.name || 'Not specified'}
                                    </Text>
                                </Space>
                            </Col>
                        </Row>
                    </Card>
                )}
            </div>
        </Modal>
    );
};

export default PrescriptionDetailModal; 