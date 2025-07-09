package com.mytelmed.core.statistics.service;

import com.mytelmed.core.article.service.ArticleService;
import com.mytelmed.core.auth.repository.AccountRepository;
import com.mytelmed.core.statistics.dto.DashboardStatsDto;
import com.mytelmed.core.statistics.entity.ContentView;
import com.mytelmed.core.statistics.repository.ContentViewRepository;
import com.mytelmed.core.tutorial.repository.TutorialRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.UUID;


/**
 * Service for calculating dashboard statistics and analytics.
 * Provides total counts and growth percentage calculations.
 */
@Slf4j
@Service
@Transactional(readOnly = true)
public class StatisticsService {
    private final AccountRepository accountRepository;
    private final ArticleService articleService;
    private final TutorialRepository tutorialRepository;
    private final ContentViewRepository contentViewRepository;

    public StatisticsService(AccountRepository accountRepository,
                           ArticleService articleService,
                           TutorialRepository tutorialRepository,
                           ContentViewRepository contentViewRepository) {
        this.accountRepository = accountRepository;
        this.articleService = articleService;
        this.tutorialRepository = tutorialRepository;
        this.contentViewRepository = contentViewRepository;
    }

    /**
     * Get comprehensive dashboard statistics including growth percentages.
     */
    public DashboardStatsDto getDashboardStats() {
        log.info("Calculating dashboard statistics");

        // Calculate current month boundaries
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfCurrentMonth = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime startOfPreviousMonth = startOfCurrentMonth.minusMonths(1);
        
        Instant currentMonthStart = startOfCurrentMonth.atZone(ZoneId.systemDefault()).toInstant();
        Instant previousMonthStart = startOfPreviousMonth.atZone(ZoneId.systemDefault()).toInstant();

        // Total counts
        long totalUsers = accountRepository.count();
        long totalArticles = articleService.findAllArticles().size(); // DynamoDB count
        long totalTutorials = tutorialRepository.count();
        long totalContentViews = contentViewRepository.countTotalViews();

        // Growth calculations
        double userGrowth = calculateUserGrowth(currentMonthStart, previousMonthStart);
        double contentGrowth = calculateContentViewGrowth(currentMonthStart, previousMonthStart);

        log.info("Dashboard stats calculated - Users: {}, Articles: {}, Tutorials: {}, Views: {}", 
                totalUsers, totalArticles, totalTutorials, totalContentViews);

        return new DashboardStatsDto(
                totalUsers,
                userGrowth,
                totalArticles,
                totalTutorials,
                totalContentViews,
                contentGrowth
        );
    }

    /**
     * Calculate user growth percentage by comparing current month to previous month.
     */
    private double calculateUserGrowth(Instant currentMonthStart, Instant previousMonthStart) {
        try {
            long usersThisMonth = accountRepository.countByCreatedAtBetween(currentMonthStart, Instant.now());
            long usersPreviousMonth = accountRepository.countByCreatedAtBetween(previousMonthStart, currentMonthStart);

            if (usersPreviousMonth == 0) {
                return usersThisMonth > 0 ? 100.0 : 0.0;
            }

            return ((double) (usersThisMonth - usersPreviousMonth) / usersPreviousMonth) * 100.0;
        } catch (Exception e) {
            log.warn("Error calculating user growth: {}", e.getMessage());
            return 0.0;
        }
    }

    /**
     * Calculate content view growth percentage by comparing current month to previous month.
     */
    private double calculateContentViewGrowth(Instant currentMonthStart, Instant previousMonthStart) {
        try {
            long viewsThisMonth = contentViewRepository.countViewsBetweenDates(currentMonthStart, Instant.now());
            long viewsPreviousMonth = contentViewRepository.countViewsBetweenDates(previousMonthStart, currentMonthStart);

            if (viewsPreviousMonth == 0) {
                return viewsThisMonth > 0 ? 100.0 : 0.0;
            }

            return ((double) (viewsThisMonth - viewsPreviousMonth) / viewsPreviousMonth) * 100.0;
        } catch (Exception e) {
            log.warn("Error calculating content view growth: {}", e.getMessage());
            return 0.0;
        }
    }

    /**
     * Track a content view for analytics.
     */
    @Transactional
    public void trackContentView(String contentId, ContentView.ContentType contentType, UUID userId, String sessionId, String ipAddress,
                                 String userAgent) {
        try {
            // Avoid duplicate views from the same user for the same content
            if (userId != null && contentViewRepository.hasUserViewedContent(contentId, contentType, userId)) {
                return;
            }

            com.mytelmed.core.statistics.entity.ContentView contentView = com.mytelmed.core.statistics.entity.ContentView.builder()
                    .contentId(contentId)
                    .contentType(contentType)
                    .userId(userId)
                    .sessionId(sessionId)
                    .ipAddress(ipAddress)
                    .userAgent(userAgent)
                    .build();

            contentViewRepository.save(contentView);
            log.debug("Tracked view for {} content ID: {}", contentType, contentId);
        } catch (Exception e) {
            log.error("Error tracking content view for {} {}: {}", contentType, contentId, e.getMessage());
        }
    }
}
