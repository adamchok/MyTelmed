"use client";

import React, { useState, useEffect } from "react";
import {
    List,
    Card,
    Typography,
    Tag,
    Avatar,
    Button,
    Empty,
    Spin,
    message,
    Modal,
    Row,
    Col,
    Divider,
} from "antd";
import {
    User,
    Clock,
    FileText,
    AlertTriangle,
    CheckCircle,
    Eye,
} from "lucide-react";
import dayjs from "dayjs";
import ReferralApi from "@/app/api/referral";
import { ReferralDto, ReferralStatus, ReferralPriority, ReferralType } from "@/app/api/referral/props";

const { Title, Text, Paragraph } = Typography;

interface MyReferralsTabProps {
    refreshTrigger: number;
}

const MyReferralsTab: React.FC<MyReferralsTabProps> = ({ refreshTrigger }) => {
    const [loading, setLoading] = useState(true);
    const [referrals, setReferrals] = useState<ReferralDto[]>([]);
    const [selectedReferral, setSelectedReferral] = useState<ReferralDto | null>(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);

    const loadReferrals = async () => {
        try {
            setLoading(true);
            const response = await ReferralApi.getReferralsByReferringDoctor();
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
            case ReferralStatus.EXPIRED:
                return "default";
            case ReferralStatus.CANCELLED:
                return "default";
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

    const handleViewDetails = (referral: ReferralDto) => {
        setSelectedReferral(referral);
        setDetailModalVisible(true);
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
                description="No referrals created yet"
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
                                borderLeftColor: getStatusColor(referral.status) === "orange" ? "#f97316" :
                                    getStatusColor(referral.status) === "green" ? "#22c55e" :
                                        getStatusColor(referral.status) === "red" ? "#ef4444" :
                                            getStatusColor(referral.status) === "blue" ? "#3b82f6" : "#6b7280"
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
                                        </div>
                                    </div>
                                </Col>

                                {/* Referral Details */}
                                <Col xs={24} sm={12} md={10}>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Text strong>Type:</Text>
                                            <Tag color={referral.referralType === ReferralType.INTERNAL ? "green" : "blue"}>
                                                {referral.referralType === ReferralType.INTERNAL ? "Internal" : "External"}
                                            </Tag>
                                        </div>
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
                                        {referral.referralType === ReferralType.INTERNAL && referral.referredDoctor && (
                                            <div className="flex items-center space-x-2 text-xs text-gray-600">
                                                <User className="w-3 h-3" />
                                                <Text>To: {referral.referredDoctor.name}</Text>
                                            </div>
                                        )}
                                        {referral.referralType === ReferralType.EXTERNAL && (
                                            <div className="flex items-center space-x-2 text-xs text-gray-600">
                                                <User className="w-3 h-3" />
                                                <Text>To: {referral.externalDoctorName}</Text>
                                            </div>
                                        )}
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
                                        <Button
                                            type="link"
                                            icon={<Eye className="w-4 h-4" />}
                                            onClick={() => handleViewDetails(referral)}
                                            className="text-green-700 hover:text-green-800 p-0 h-auto"
                                        >
                                            View Details
                                        </Button>
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
                            </div>
                        </div>

                        {/* Referred Doctor Information */}
                        {selectedReferral.referralType === ReferralType.INTERNAL && selectedReferral.referredDoctor && (
                            <div>
                                <Title level={4} className="mb-3">Referred Doctor</Title>
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <div className="flex items-center space-x-4">
                                        <Avatar
                                            src={selectedReferral.referredDoctor.profileImageUrl}
                                            icon={<User className="w-4 h-4" />}
                                            size={48}
                                        />
                                        <div>
                                            <Text strong className="block">{selectedReferral.referredDoctor.name}</Text>
                                            <Text type="secondary">{selectedReferral.referredDoctor.email}</Text>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* External Doctor Information */}
                        {selectedReferral.referralType === ReferralType.EXTERNAL && (
                            <div>
                                <Title level={4} className="mb-3">External Doctor</Title>
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <Row gutter={[16, 8]}>
                                        <Col span={12}>
                                            <Text strong>Name:</Text> {selectedReferral.externalDoctorName}
                                        </Col>
                                        <Col span={12}>
                                            <Text strong>Speciality:</Text> {selectedReferral.externalDoctorSpeciality}
                                        </Col>
                                        <Col span={24}>
                                            <Text strong>Facility:</Text> {selectedReferral.externalFacilityName}
                                        </Col>
                                        <Col span={24}>
                                            <Text strong>Address:</Text> {selectedReferral.externalFacilityAddress}
                                        </Col>
                                        {selectedReferral.externalContactNumber && (
                                            <Col span={12}>
                                                <Text strong>Phone:</Text> {selectedReferral.externalContactNumber}
                                            </Col>
                                        )}
                                        {selectedReferral.externalEmail && (
                                            <Col span={12}>
                                                <Text strong>Email:</Text> {selectedReferral.externalEmail}
                                            </Col>
                                        )}
                                    </Row>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </>
    );
};

export default MyReferralsTab;
