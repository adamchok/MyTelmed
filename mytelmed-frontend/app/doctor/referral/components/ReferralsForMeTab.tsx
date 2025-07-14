"use client";

import React, { useState, useEffect } from "react";
import {
    List,
    Card,
    Typography,
    Tag,
    Avatar,
    Button,
    Space,
    Empty,
    Spin,
    message,
    Modal,
    Row,
    Col,
    Divider,
    Input,
    Popconfirm,
} from "antd";
import {
    User,
    Calendar,
    Clock,
    CheckCircle,
    XCircle,
    Eye,
    AlertTriangle,
    FileText,
} from "lucide-react";
import dayjs from "dayjs";
import ReferralApi from "@/app/api/referral";
import { ReferralDto, ReferralStatus, ReferralPriority, UpdateReferralStatusRequestDto } from "@/app/api/referral/props";
import ScheduleAppointmentModal from "./ScheduleAppointmentModal";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface ReferralsForMeTabProps {
    refreshTrigger: number;
    onRefresh: () => void;
}

const ReferralsForMeTab: React.FC<ReferralsForMeTabProps> = ({ refreshTrigger, onRefresh }) => {
    const [loading, setLoading] = useState(true);
    const [referrals, setReferrals] = useState<ReferralDto[]>([]);
    const [selectedReferral, setSelectedReferral] = useState<ReferralDto | null>(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [rejectModalVisible, setRejectModalVisible] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [scheduleModalVisible, setScheduleModalVisible] = useState(false);

    const loadReferrals = async () => {
        try {
            setLoading(true);
            const response = await ReferralApi.getReferralsByReferredDoctor();
            if (response.data.isSuccess && response.data.data) {
                setReferrals(response.data.data.content || []);
            }
        } catch {
            message.error("Failed to load referrals");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReferrals();
    }, [refreshTrigger]);

    const handleAcceptReferral = async (referralId: string) => {
        try {
            setActionLoading(referralId);
            const request: UpdateReferralStatusRequestDto = {
                status: ReferralStatus.ACCEPTED,
            };
            await ReferralApi.updateReferralStatus(referralId, request);
            message.success("Referral accepted successfully");
            onRefresh();
        } catch {
            message.error("Failed to accept referral");
        } finally {
            setActionLoading(null);
        }
    };

    const handleRejectReferral = async () => {
        if (!selectedReferral || !rejectionReason.trim()) {
            message.error("Please provide a reason for rejection");
            return;
        }

        try {
            setActionLoading(selectedReferral.id);
            const request: UpdateReferralStatusRequestDto = {
                status: ReferralStatus.REJECTED,
                rejectionReason: rejectionReason.trim(),
            };
            await ReferralApi.updateReferralStatus(selectedReferral.id, request);
            message.success("Referral rejected");
            setRejectModalVisible(false);
            setRejectionReason("");
            setSelectedReferral(null);
            onRefresh();
        } catch {
            message.error("Failed to reject referral");
        } finally {
            setActionLoading(null);
        }
    };

    const handleScheduleAppointment = (referral: ReferralDto) => {
        setSelectedReferral(referral);
        setScheduleModalVisible(true);
    };

    const handleScheduleSuccess = () => {
        setScheduleModalVisible(false);
        setSelectedReferral(null);
        message.success("Appointment scheduled successfully");
        onRefresh();
    };

    const getStatusColor = (status: ReferralStatus) => {
        switch (status) {
            case ReferralStatus.PENDING:
                return "orange";
            case ReferralStatus.ACCEPTED:
                return "green";
            case ReferralStatus.REJECTED:
                return "red";
            case ReferralStatus.SCHEDULED:
                return "blue";
            case ReferralStatus.COMPLETED:
                return "gray";
            default:
                return "default";
        }
    };

    const getPriorityColor = (priority: ReferralPriority) => {
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
    };

    const getPriorityIcon = (priority: ReferralPriority) => {
        switch (priority) {
            case ReferralPriority.EMERGENCY:
                return <AlertTriangle className="w-4 h-4" />;
            case ReferralPriority.URGENT:
                return <Clock className="w-4 h-4" />;
            case ReferralPriority.ROUTINE:
                return <CheckCircle className="w-4 h-4" />;
            default:
                return <FileText className="w-4 h-4" />;
        }
    };

    const getBorderLeftColor = (status: ReferralStatus) => {
        const statusColor = getStatusColor(status);
        switch (statusColor) {
            case "orange":
                return "#f97316";
            case "green":
                return "#22c55e";
            case "red":
                return "#ef4444";
            case "blue":
                return "#3b82f6";
            default:
                return "#6b7280";
        }
    };

    const handleViewDetails = (referral: ReferralDto) => {
        setSelectedReferral(referral);
        setDetailModalVisible(true);
    };

    const openRejectModal = (referral: ReferralDto) => {
        setSelectedReferral(referral);
        setRejectModalVisible(true);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Spin size="large" />
            </div>
        );
    }

    if (referrals.length === 0) {
        return (
            <Empty
                description="No referrals received yet"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
        );
    }

    return (
        <>
            <List
                itemLayout="vertical"
                dataSource={referrals}
                renderItem={(referral) => (
                    <List.Item key={referral.id}>
                        <Card
                            className="hover:shadow-md transition-shadow border-l-4"
                            style={{
                                borderLeftColor: getBorderLeftColor(referral.status)
                            }}
                        >
                            <Row gutter={[16, 16]}>
                                {/* Patient Info */}
                                <Col xs={24} sm={12} md={8}>
                                    <div className="flex items-center space-x-3">
                                        <Avatar
                                            src={referral.patient.profileImageUrl}
                                            icon={<User className="w-4 h-4" />}
                                            size={48}
                                            className="border-2 border-green-100"
                                        />
                                        <div className="flex-1">
                                            <Title level={5} className="mb-1">
                                                {referral.patient.name}
                                            </Title>
                                            <Text type="secondary" className="text-xs">
                                                {referral.referralNumber}
                                            </Text>
                                            <div className="flex items-center space-x-2 text-xs text-gray-600 mt-1">
                                                <User className="w-3 h-3" />
                                                <Text>From: {referral.referringDoctor.name}</Text>
                                            </div>
                                        </div>
                                    </div>
                                </Col>

                                {/* Referral Details */}
                                <Col xs={24} sm={12} md={10}>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Text strong>Priority:</Text>
                                            <Tag
                                                color={getPriorityColor(referral.priority)}
                                                icon={getPriorityIcon(referral.priority)}
                                            >
                                                {referral.priority}
                                            </Tag>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <Text strong>Status:</Text>
                                            <Tag color={getStatusColor(referral.status)}>
                                                {referral.status}
                                            </Tag>
                                        </div>
                                        <div className="text-xs text-gray-600">
                                            <Text strong>Reason:</Text>
                                            <div className="mt-1 line-clamp-2">
                                                {referral.reasonForReferral}
                                            </div>
                                        </div>
                                    </div>
                                </Col>

                                {/* Actions */}
                                <Col xs={24} sm={24} md={6}>
                                    <div className="flex flex-col space-y-2">
                                        <div className="text-xs text-gray-500">
                                            Created: {dayjs(referral.createdAt).format("MMM DD, YYYY")}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            Expires: {dayjs(referral.expiryDate).format("MMM DD, YYYY")}
                                        </div>

                                        <Space direction="vertical" size="small" className="w-full">
                                            <Button
                                                type="link"
                                                icon={<Eye className="w-4 h-4" />}
                                                onClick={() => handleViewDetails(referral)}
                                                className="text-green-700 hover:text-green-800 p-0 h-auto"
                                            >
                                                View Details
                                            </Button>

                                            {referral.status === ReferralStatus.PENDING && (
                                                <Space size="small" className="w-full">
                                                    <Popconfirm
                                                        title="Accept this referral?"
                                                        description="You will be able to schedule an appointment after accepting."
                                                        onConfirm={() => handleAcceptReferral(referral.id)}
                                                        okText="Accept"
                                                        cancelText="Cancel"
                                                        okButtonProps={{
                                                            className: "bg-green-700 hover:bg-green-800 border-green-700"
                                                        }}
                                                    >
                                                        <Button
                                                            type="primary"
                                                            icon={<CheckCircle className="w-3 h-3" />}
                                                            size="small"
                                                            loading={actionLoading === referral.id}
                                                            className="bg-green-700 hover:bg-green-800 border-green-700"
                                                        >
                                                            Accept
                                                        </Button>
                                                    </Popconfirm>

                                                    <Button
                                                        danger
                                                        icon={<XCircle className="w-3 h-3" />}
                                                        size="small"
                                                        onClick={() => openRejectModal(referral)}
                                                        loading={actionLoading === referral.id}
                                                    >
                                                        Reject
                                                    </Button>
                                                </Space>
                                            )}

                                            {referral.status === ReferralStatus.ACCEPTED && (
                                                <Button
                                                    type="primary"
                                                    icon={<Calendar className="w-3 h-3" />}
                                                    size="small"
                                                    onClick={() => handleScheduleAppointment(referral)}
                                                    className="bg-blue-600 hover:bg-blue-700 border-blue-600"
                                                >
                                                    Schedule
                                                </Button>
                                            )}
                                        </Space>
                                    </div>
                                </Col>
                            </Row>
                        </Card>
                    </List.Item>
                )}
            />

            {/* Detail Modal */}
            <Modal
                title={`Referral Details - ${selectedReferral?.referralNumber}`}
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                footer={null}
                width={800}
                className="top-4"
            >
                {selectedReferral && (
                    <div className="space-y-6">
                        {/* Patient Information */}
                        <div>
                            <Title level={4} className="mb-3">Patient Information</Title>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <Row gutter={[16, 8]}>
                                    <Col span={12}>
                                        <Text strong>Name:</Text> {selectedReferral.patient.name}
                                    </Col>
                                    <Col span={12}>
                                        <Text strong>Gender:</Text> {selectedReferral.patient.gender}
                                    </Col>
                                    <Col span={12}>
                                        <Text strong>Date of Birth:</Text> {selectedReferral.patient.dateOfBirth}
                                    </Col>
                                    <Col span={12}>
                                        <Text strong>Phone:</Text> {selectedReferral.patient.phone}
                                    </Col>
                                </Row>
                            </div>
                        </div>

                        {/* Referring Doctor Information */}
                        <div>
                            <Title level={4} className="mb-3">Referring Doctor</Title>
                            <div className="bg-green-50 p-4 rounded-lg">
                                <div className="flex items-center space-x-4">
                                    <Avatar
                                        src={selectedReferral.referringDoctor.profileImageUrl}
                                        icon={<User className="w-4 h-4" />}
                                        size={48}
                                    />
                                    <div>
                                        <Text strong className="block">{selectedReferral.referringDoctor.name}</Text>
                                        <Text type="secondary">{selectedReferral.referringDoctor.email}</Text>
                                        {selectedReferral.referringDoctor.facility && (
                                            <Text type="secondary" className="block">
                                                {selectedReferral.referringDoctor.facility.name}
                                            </Text>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Referral Information */}
                        <div>
                            <Title level={4} className="mb-3">Referral Information</Title>
                            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                                <div>
                                    <Text strong>Reason for Referral:</Text>
                                    <Paragraph className="mt-2 mb-0">
                                        {selectedReferral.reasonForReferral}
                                    </Paragraph>
                                </div>
                                <Divider className="my-3" />
                                <div>
                                    <Text strong>Clinical Summary:</Text>
                                    <Paragraph className="mt-2 mb-0">
                                        {selectedReferral.clinicalSummary}
                                    </Paragraph>
                                </div>
                                {selectedReferral.investigationsDone && (
                                    <>
                                        <Divider className="my-3" />
                                        <div>
                                            <Text strong>Investigations Done:</Text>
                                            <Paragraph className="mt-2 mb-0">
                                                {selectedReferral.investigationsDone}
                                            </Paragraph>
                                        </div>
                                    </>
                                )}
                                {selectedReferral.currentMedications && (
                                    <>
                                        <Divider className="my-3" />
                                        <div>
                                            <Text strong>Current Medications:</Text>
                                            <Paragraph className="mt-2 mb-0">
                                                {selectedReferral.currentMedications}
                                            </Paragraph>
                                        </div>
                                    </>
                                )}
                                {selectedReferral.allergies && (
                                    <>
                                        <Divider className="my-3" />
                                        <div>
                                            <Text strong>Allergies:</Text>
                                            <Paragraph className="mt-2 mb-0">
                                                {selectedReferral.allergies}
                                            </Paragraph>
                                        </div>
                                    </>
                                )}
                                {selectedReferral.vitalSigns && (
                                    <>
                                        <Divider className="my-3" />
                                        <div>
                                            <Text strong>Vital Signs:</Text>
                                            <Paragraph className="mt-2 mb-0">
                                                {selectedReferral.vitalSigns}
                                            </Paragraph>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Reject Modal */}
            <Modal
                title="Reject Referral"
                open={rejectModalVisible}
                onCancel={() => {
                    setRejectModalVisible(false);
                    setRejectionReason("");
                    setSelectedReferral(null);
                }}
                footer={[
                    <Button
                        key="cancel"
                        onClick={() => {
                            setRejectModalVisible(false);
                            setRejectionReason("");
                            setSelectedReferral(null);
                        }}
                    >
                        Cancel
                    </Button>,
                    <Button
                        key="reject"
                        danger
                        onClick={handleRejectReferral}
                        loading={actionLoading === selectedReferral?.id}
                    >
                        Reject Referral
                    </Button>,
                ]}
            >
                <div className="space-y-4">
                    <Text>Please provide a reason for rejecting this referral:</Text>
                    <TextArea
                        rows={4}
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Enter reason for rejection..."
                        maxLength={500}
                        showCount
                    />
                </div>
            </Modal>

            {/* Schedule Appointment Modal */}
            <ScheduleAppointmentModal
                visible={scheduleModalVisible}
                referral={selectedReferral}
                onCancel={() => {
                    setScheduleModalVisible(false);
                    setSelectedReferral(null);
                }}
                onSuccess={handleScheduleSuccess}
            />
        </>
    );
};

export default ReferralsForMeTab; 