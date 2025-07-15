"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { message, Spin } from "antd";
import ReferralApi from "@/app/api/referral";
import { ReferralStatisticsDto } from "@/app/api/referral/props";
import DoctorReferralComponent from "./component";

export default function DoctorReferralPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [statistics, setStatistics] = useState<ReferralStatisticsDto | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [error, setError] = useState<string | null>(null);

    // Load statistics
    const loadStatistics = async () => {
        try {
            const response = await ReferralApi.getReferralStatistics();
            if (response.data.isSuccess && response.data.data) {
                setStatistics(response.data.data);
            }
        } catch {
            console.error("Failed to load statistics");
            setError("Failed to load statistics");
        }
    };

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            await loadStatistics();
        } catch {
            message.error("Failed to load referral data");
            setError("Failed to load referral data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [refreshTrigger]);

    const handleRefresh = () => {
        setRefreshTrigger((prev) => prev + 1);
    };

    const handleCreateReferral = () => {
        router.push("/doctor/referral/create");
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <DoctorReferralComponent
            statistics={statistics}
            onRefresh={handleRefresh}
            onCreateReferral={handleCreateReferral}
            loading={loading}
            error={error}
            refreshTrigger={refreshTrigger}
        />
    );
}
