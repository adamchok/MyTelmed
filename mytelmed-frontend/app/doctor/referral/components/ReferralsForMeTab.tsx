"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Typography,
    Empty,
    Spin,
    message,
    Modal,
    Input,
} from "antd";
import ReferralApi from "@/app/api/referral";
import { ReferralDto, ReferralStatus, UpdateReferralStatusRequestDto } from "@/app/api/referral/props";
import DoctorReferralCard from "./DoctorReferralCard";
import DoctorReferralDetailModal from "./DoctorReferralDetailModal";

const { Text } = Typography;
const { TextArea } = Input;

interface ReferralsForMeTabProps {
    refreshTrigger: number;
    onRefresh: () => void;
}

const ReferralsForMeTab: React.FC<ReferralsForMeTabProps> = ({ refreshTrigger, onRefresh }) => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [referrals, setReferrals] = useState<ReferralDto[]>([]);
    const [selectedReferral, setSelectedReferral] = useState<ReferralDto | null>(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [rejectModalVisible, setRejectModalVisible] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [actionLoading, setActionLoading] = useState<string | null>(null);

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
        router.push(`/doctor/referral/schedule/${referral.id}`);
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
            <div className="py-12">
                <Empty
                    description="No referrals received yet"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
            </div>
        );
    }

    return (
        <>
            <div className="space-y-4">
                {referrals.map((referral) => (
                    <DoctorReferralCard
                        key={referral.id}
                        referral={referral}
                        onViewDetails={handleViewDetails}
                        onAccept={handleAcceptReferral}
                        onReject={openRejectModal}
                        onScheduleAppointment={handleScheduleAppointment}
                        actionLoading={actionLoading}
                        isIncoming={true} // These are incoming referrals (for this doctor)
                    />
                ))}
            </div>

            {/* Detail Modal */}
            <DoctorReferralDetailModal
                referral={selectedReferral}
                isVisible={detailModalVisible}
                onClose={() => setDetailModalVisible(false)}
                onAccept={handleAcceptReferral}
                onReject={openRejectModal}
                onScheduleAppointment={handleScheduleAppointment}
                actionLoading={actionLoading}
                isIncoming={true} // These are incoming referrals
            />

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
                    <button
                        key="cancel"
                        onClick={() => {
                            setRejectModalVisible(false);
                            setRejectionReason("");
                            setSelectedReferral(null);
                        }}
                        className="px-4 py-2 mr-2 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        Cancel
                    </button>,
                    <button
                        key="reject"
                        onClick={handleRejectReferral}
                        disabled={actionLoading === selectedReferral?.id}
                        className="px-4 py-2 text-white bg-red-600 border border-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
                    >
                        {actionLoading === selectedReferral?.id ? "Rejecting..." : "Reject Referral"}
                    </button>,
                ]}
                centered
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


        </>
    );
};

export default ReferralsForMeTab; 