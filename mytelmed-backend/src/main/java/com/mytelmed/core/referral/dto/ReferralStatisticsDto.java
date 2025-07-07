package com.mytelmed.core.referral.dto;

public record ReferralStatisticsDto(
        long pendingCount,
        long acceptedCount,
        long scheduledCount,
        long completedCount
) {
}
