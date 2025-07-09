package com.mytelmed.core.statistics.dto;

/**
 * DTO for dashboard statistics response.
 * Matches the frontend structure for statistics display.
 */
public record DashboardStatsDto(
        long totalUsers,
        double userGrowth,
        long totalArticles,
        long totalTutorials,
        long contentViews,
        double contentGrowth
) {
}
