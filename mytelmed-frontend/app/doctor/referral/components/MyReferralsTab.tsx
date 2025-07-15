"use client";

import React, { useState, useEffect } from "react";
import {
    Empty,
    Spin,
    message,
} from "antd";
import ReferralApi from "@/app/api/referral";
import { ReferralDto } from "@/app/api/referral/props";
import DoctorReferralCard from "./DoctorReferralCard";
import DoctorReferralDetailModal from "./DoctorReferralDetailModal";

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
            <div className="py-12">
                <Empty
                    description="No referrals created yet"
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
                        isIncoming={false} // These are outgoing referrals (created by this doctor)
                    />
                ))}
            </div>

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
