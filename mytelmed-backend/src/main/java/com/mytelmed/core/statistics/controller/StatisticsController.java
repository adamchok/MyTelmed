package com.mytelmed.core.statistics.controller;

import com.mytelmed.common.dto.ApiResponse;
import com.mytelmed.core.statistics.dto.DashboardStatsDto;
import com.mytelmed.core.statistics.service.StatisticsService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller for statistics and analytics endpoints.
 * Provides dashboard statistics for admin users.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/statistics")
public class StatisticsController {
    
    private final StatisticsService statisticsService;

    public StatisticsController(StatisticsService statisticsService) {
        this.statisticsService = statisticsService;
    }

    /**
     * Get dashboard statistics including total counts and growth percentages.
     * Only accessible by admin users.
     */
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DashboardStatsDto>> getDashboardStats() {
        log.info("Received request to get dashboard statistics");

        try {
            DashboardStatsDto stats = statisticsService.getDashboardStats();
            log.info("Successfully calculated dashboard statistics");
            return ResponseEntity.ok(ApiResponse.success(stats));
        } catch (Exception e) {
            log.error("Error calculating dashboard statistics: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(ApiResponse.failure(null, "Failed to calculate dashboard statistics"));
        }
    }
}
