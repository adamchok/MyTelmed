package com.mytelmed.core.notification.repository;

import com.mytelmed.core.notification.entity.PushSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;


@Repository
public interface PushSubscriptionRepository extends JpaRepository<PushSubscription, UUID> {
    List<PushSubscription> findByAccountIdAndIsActiveTrue(UUID accountId);

    Optional<PushSubscription> findByAccountIdAndEndpointAndIsActiveTrue(UUID accountId, String endpoint);

    boolean existsByAccountIdAndEndpointAndIsActiveTrue(UUID accountId, String endpoint);

    @Modifying
    @Query("UPDATE PushSubscription p SET p.isActive = false WHERE p.account.id = :accountId")
    int deactivateAllSubscriptionsByAccountId(@Param("accountId") UUID accountId);

    @Modifying
    @Query("UPDATE PushSubscription p SET p.isActive = false WHERE p.endpoint = :endpoint")
    void deactivateSubscriptionByEndpoint(@Param("endpoint") String endpoint);

    @Modifying
    @Query("UPDATE PushSubscription p SET p.lastUsedAt = :lastUsedAt WHERE p.id = :id")
    void updateLastUsedAtById(@Param("id") UUID id, @Param("lastUsedAt") Instant lastUsedAt);

    @Query("SELECT COUNT(p) FROM PushSubscription p WHERE p.account.id = :accountId AND p.isActive = true")
    long countActiveSubscriptionsByAccountId(@Param("accountId") UUID accountId);
}
