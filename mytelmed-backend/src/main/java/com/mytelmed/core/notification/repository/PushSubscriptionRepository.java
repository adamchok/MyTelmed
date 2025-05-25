package com.mytelmed.core.notification.repository;

import com.mytelmed.core.notification.entity.PushSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;


@Repository
public interface PushSubscriptionRepository extends JpaRepository<PushSubscription, UUID> {
    List<PushSubscription> findByAccountId(UUID accountId);
    Optional<PushSubscription> findByAccountIdAndEndpoint(UUID accountId, String endpoint);
    void deleteByAccountIdAndEndpoint(UUID accountId, String endpoint);
}
