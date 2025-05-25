package com.mytelmed.core.notification.service;

import com.mytelmed.common.advice.exception.ResourceNotFoundException;
import com.mytelmed.common.constants.NotificationType;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.auth.service.AccountService;
import com.mytelmed.core.image.entity.Image;
import com.mytelmed.core.notification.entity.Notification;
import com.mytelmed.core.notification.repository.NotificationRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;


@Slf4j
@Service
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final AccountService accountService;
    private final WebPushService webPushService;

    public NotificationService(NotificationRepository notificationRepository, AccountService accountService, WebPushService webPushService) {
        this.notificationRepository = notificationRepository;
        this.accountService = accountService;
        this.webPushService = webPushService;
    }

    @Transactional
    public Optional<Notification> createNotification(UUID accountId, String title, String content,
                                                     Image image, String actionUrl, NotificationType type) {
        try {
            Account account = accountService.getAccountById(accountId);

            Notification notification = Notification.builder()
                    .account(account)
                    .title(title)
                    .content(content)
                    .notificationImage(image)
                    .actionUrl(actionUrl)
                    .notificationType(type)
                    .build();

            Notification savedNotification = notificationRepository.save(notification);

            webPushService.sendNotification(account, title, content, actionUrl);

            return Optional.of(savedNotification);
        } catch (Exception e) {
            log.error("Unexpected error occurred while creating notification for account: {}", accountId, e);
        }
        return Optional.empty();
    }

    @Transactional(readOnly = true)
    public Page<Notification> getPaginatedNotificationsByAccountId(UUID accountId, int page, int pageSize) {
        Pageable pageable = PageRequest.of(page, pageSize);
        return notificationRepository.findByAccountIdOrderByCreatedAtDesc(accountId, pageable);
    }

    @Transactional(readOnly = true)
    public List<Notification> getUnreadNotifications(UUID accountId) {
        return notificationRepository.findTop10ByAccountIdAndIsReadFalseOrderByCreatedAtDesc(accountId);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(UUID accountId) {
        return notificationRepository.countByAccountIdAndIsReadFalse(accountId);
    }

    @Transactional
    public void markAsReadByAccountId(UUID notificationId, UUID accountId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> {
                    log.warn("Notification not found with ID: {}", notificationId);
                    return new ResourceNotFoundException("Notification not found");
                });

        if (notification.getAccount().getId().equals(accountId)) {
            notification.setRead(true);
            notification.setReadAt(Instant.now());
            notificationRepository.save(notification);
        } else {
            log.warn("Notification not found for account with ID: {}", accountId);
            throw new ResourceNotFoundException("Failed to mark notification as read");
        }
    }

    @Transactional
    public long markAllAsRead(UUID accountId) {
        return notificationRepository.markAllAsRead(accountId);
    }
}
