"use client";

import React, { useState, useEffect } from "react";
import {
    Empty,
    Spin,
    message,
    Typography,
} from "antd";
import ReferralApi from "@/app/api/referral";
import { ReferralDto, ReferralStatus, ReferralPriority, ReferralType } from "@/app/api/referral/props";
import DoctorReferralCard from "./DoctorReferralCard";
import DoctorReferralDetailModal from "./DoctorReferralDetailModal";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";

const { Text } = Typography;

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

interface MyReferralsTabProps {
    refreshTrigger: number;
    filterState?: FilterState;
    getStatusColor: (status: ReferralStatus) => string;
    getStatusIcon: (status: ReferralStatus) => React.ReactNode;
    getPriorityColor: (priority: ReferralPriority) => string;
    getPriorityIcon: (priority: ReferralPriority) => React.ReactNode;
}

const MyReferralsTab: React.FC<MyReferralsTabProps> = ({
    refreshTrigger,
    filterState,
    getStatusColor,
    getStatusIcon,
    getPriorityColor,
    getPriorityIcon,
}) => {
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

    const handleViewDetails = (referral: ReferralDto) => {
        setSelectedReferral(referral);
        setDetailModalVisible(true);
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
            (referral.referredDoctor?.name || "").toLowerCase().includes(filterState.searchTerm.toLowerCase()) ||
            (referral.externalDoctorName || "").toLowerCase().includes(filterState.searchTerm.toLowerCase());

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
                                : "No referrals created yet"
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
                            isIncoming={false} // These are outgoing referrals (created by this doctor)
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
                isIncoming={false} // These are outgoing referrals
            />
        </>
    );
};

export default MyReferralsTab;
