package com.mytelmed.core.notification.repository;

import com.mytelmed.core.notification.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;


@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    Page<Notification> findByAccountIdOrderByCreatedAtDesc(UUID accountId, Pageable pageable);

    List<Notification> findTop10ByAccountIdAndIsReadFalseOrderByCreatedAtDesc(UUID accountId);

    long countByAccountIdAndIsReadFalse(UUID accountId);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = CURRENT_TIMESTAMP WHERE n.account.id = :accountId AND n.isRead = false")
    long markAllAsRead(UUID accountId);
}
