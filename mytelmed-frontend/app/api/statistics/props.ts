/**
 * Dashboard statistics data structure
 * Matches the DashboardStatsDto from the backend
 */
export interface DashboardStats {
    totalUsers: number;
    userGrowth: number;
    totalArticles: number;
    totalTutorials: number;
    contentViews: number;
    contentGrowth: number;
}
