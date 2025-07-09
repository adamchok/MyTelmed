package com.mytelmed.core.statistics.repository;

import com.mytelmed.core.statistics.entity.ContentView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.Instant;
import java.util.UUID;

/**
 * Repository for ContentView entity with custom analytics queries.
 */
@Repository
public interface ContentViewRepository extends JpaRepository<ContentView, UUID> {
    
    /**
     * Count total content views across all content types.
     */
    @Query("SELECT COUNT(cv) FROM ContentView cv")
    long countTotalViews();
    
    /**
     * Count content views within a specific date range.
     */
    @Query("SELECT COUNT(cv) FROM ContentView cv WHERE cv.viewedAt BETWEEN :startDate AND :endDate")
    long countViewsBetweenDates(@Param("startDate") Instant startDate, @Param("endDate") Instant endDate);
    
    /**
     * Count views for a specific content type.
     */
    @Query("SELECT COUNT(cv) FROM ContentView cv WHERE cv.contentType = :contentType")
    long countViewsByContentType(@Param("contentType") ContentView.ContentType contentType);
    
    /**
     * Count views for a specific content item.
     */
    @Query("SELECT COUNT(cv) FROM ContentView cv WHERE cv.contentId = :contentId AND cv.contentType = :contentType")
    long countViewsForContent(@Param("contentId") String contentId, @Param("contentType") ContentView.ContentType contentType);
    
    /**
     * Check if a user has already viewed specific content (for unique view tracking).
     */
    @Query("SELECT COUNT(cv) > 0 FROM ContentView cv WHERE cv.contentId = :contentId AND cv.contentType = :contentType AND cv.userId = :userId")
    boolean hasUserViewedContent(@Param("contentId") String contentId, @Param("contentType") ContentView.ContentType contentType, @Param("userId") UUID userId);
}
