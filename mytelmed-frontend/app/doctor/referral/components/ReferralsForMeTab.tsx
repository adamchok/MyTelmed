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
import { ReferralDto, ReferralStatus, ReferralPriority, ReferralType, UpdateReferralStatusRequestDto } from "@/app/api/referral/props";
import DoctorReferralCard from "./DoctorReferralCard";
import DoctorReferralDetailModal from "./DoctorReferralDetailModal";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";

const { Text } = Typography;
const { TextArea } = Input;

type SortField = "createdAt" | "expiryDate" | "patientName" | "status" | "priority";
type SortDirection = "asc" | "desc";

interface FilterState {
    searchTerm: string;
    selectedStatus: ReferralStatus | "all";
    selectedPriority: ReferralPriority | "all";
    selectedType: ReferralType | "all";
    dateRange: [Dayjs | null, Dayjs | null] | null;
    sortField: SortField;
    sortDirection: SortDirection;
    showFilters: boolean;
}

interface ReferralsForMeTabProps {
    refreshTrigger: number;
    onRefresh: () => void;
    filterState?: FilterState;
    getStatusColor: (status: ReferralStatus) => string;
    getStatusIcon: (status: ReferralStatus) => React.ReactNode;
    getPriorityColor: (priority: ReferralPriority) => string;
    getPriorityIcon: (priority: ReferralPriority) => React.ReactNode;
}

const ReferralsForMeTab: React.FC<ReferralsForMeTabProps> = ({
    refreshTrigger,
    onRefresh,
    filterState,
    getStatusColor,
    getStatusIcon,
    getPriorityColor,
    getPriorityIcon,
}) => {
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

    // Filter referrals based on search criteria
    const filteredReferrals = filterState ? referrals.filter((referral) => {
        // Text search filter
        const matchesSearch =
            filterState.searchTerm === "" ||
            referral.referralNumber.toLowerCase().includes(filterState.searchTerm.toLowerCase()) ||
            referral.patient.name.toLowerCase().includes(filterState.searchTerm.toLowerCase()) ||
            referral.reasonForReferral.toLowerCase().includes(filterState.searchTerm.toLowerCase()) ||
            referral.clinicalSummary.toLowerCase().includes(filterState.searchTerm.toLowerCase()) ||
            referral.referringDoctor.name.toLowerCase().includes(filterState.searchTerm.toLowerCase());

        // Status filter
        const matchesStatus = filterState.selectedStatus === "all" || referral.status === filterState.selectedStatus;

        // Priority filter
        const matchesPriority = filterState.selectedPriority === "all" || referral.priority === filterState.selectedPriority;

        // Type filter
        const matchesType = filterState.selectedType === "all" || referral.referralType === filterState.selectedType;

        // Date range filter (created date)
        const matchesDateRange =
            !filterState.dateRange?.[0] ||
            !filterState.dateRange?.[1] ||
            (dayjs(referral.createdAt).isAfter(filterState.dateRange[0]) &&
                dayjs(referral.createdAt).isBefore(filterState.dateRange[1].add(1, "day")));

        return matchesSearch && matchesStatus && matchesPriority && matchesType && matchesDateRange;
    }) : referrals;

    // Sort referrals based on selected criteria
    const sortedReferrals = filterState ? [...filteredReferrals].sort((a, b) => {
        let aValue: string | Date | number;
        let bValue: string | Date | number;

        if (filterState.sortField === "expiryDate") {
            aValue = new Date(a.expiryDate);
            bValue = new Date(b.expiryDate);
        } else if (filterState.sortField === "patientName") {
            aValue = a.patient.name.toLowerCase();
            bValue = b.patient.name.toLowerCase();
        } else if (filterState.sortField === "status") {
            aValue = a.status;
            bValue = b.status;
        } else if (filterState.sortField === "priority") {
            aValue = a.priority;
            bValue = b.priority;
        } else {
            // Default to createdAt
            aValue = new Date(a.createdAt);
            bValue = new Date(b.createdAt);
        }

        let comparison = 0;
        if (aValue < bValue) {
            comparison = -1;
        } else if (aValue > bValue) {
            comparison = 1;
        }
        return filterState.sortDirection === "asc" ? comparison : -comparison;
    }) : filteredReferrals;

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Spin size="large" />
            </div>
        );
    }

    const displayReferrals = sortedReferrals;

    return (
        <>
            {/* Results Summary */}
            {filterState && (
                <div className="flex justify-between items-center mb-4">
                    <Text className="text-gray-600">
                        Showing {displayReferrals.length} of {referrals.length} referrals
                        {filterState.searchTerm && (
                            <span className="ml-1">matching &ldquo;{filterState.searchTerm}&rdquo;</span>
                        )}
                        {filterState.selectedStatus !== "all" && (
                            <span className="ml-1">with status &ldquo;{filterState.selectedStatus}&rdquo;</span>
                        )}
                        {filterState.selectedPriority !== "all" && (
                            <span className="ml-1">priority &ldquo;{filterState.selectedPriority}&rdquo;</span>
                        )}
                        {filterState.selectedType !== "all" && (
                            <span className="ml-1">type &ldquo;{filterState.selectedType}&rdquo;</span>
                        )}
                    </Text>
                    {filterState.sortField && (
                        <Text className="text-xs text-gray-500">
                            Sorted by {filterState.sortField} ({filterState.sortDirection})
                        </Text>
                    )}
                </div>
            )}

            {displayReferrals.length === 0 ? (
                <div className="py-12">
                    <Empty
                        description={
                            filterState && (filterState.searchTerm || filterState.selectedStatus !== "all" ||
                                filterState.selectedPriority !== "all" || filterState.selectedType !== "all" ||
                                filterState.dateRange)
                                ? "No referrals found matching your criteria"
                                : "No referrals received yet"
                        }
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                </div>
            ) : (
                <div className="space-y-4">
                    {displayReferrals.map((referral) => (
                        <DoctorReferralCard
                            key={referral.id}
                            referral={referral}
                            onViewDetails={handleViewDetails}
                            onAccept={handleAcceptReferral}
                            onReject={openRejectModal}
                            onScheduleAppointment={handleScheduleAppointment}
                            actionLoading={actionLoading}
                            isIncoming={true} // These are incoming referrals (for this doctor)
                            getStatusColor={getStatusColor}
                            getStatusIcon={getStatusIcon}
                            getPriorityColor={getPriorityColor}
                            getPriorityIcon={getPriorityIcon}
                        />
                    ))}
                </div>
            )}

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
