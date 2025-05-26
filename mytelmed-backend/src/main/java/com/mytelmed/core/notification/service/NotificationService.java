package com.mytelmed.core.notification.service;

import com.mytelmed.common.advice.AppException;
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
    public Page<Notification> getPaginatedNotificationsByAccountId(UUID accountId, int page, int pageSize) throws AppException {
        log.debug("Fetching notifications for account with ID: {} page: {} pageSize: {}", accountId, page, pageSize);

        try {
            Pageable pageable = PageRequest.of(page, pageSize);
            return notificationRepository.findByAccountIdOrderByCreatedAtDesc(accountId, pageable);
        } catch (Exception e) {
            log.error("Unexpected error occurred while fetching notifications for account: {}", accountId, e);
            throw new AppException("Failed to fetch notifications");
        }
    }

    @Transactional(readOnly = true)
    public List<Notification> getUnreadNotifications(UUID accountId) throws AppException {
        log.debug("Fetching unread notifications for account with ID: {}", accountId);

        try {
            return notificationRepository.findTop10ByAccountIdAndReadFalseOrderByCreatedAtDesc(accountId);
        } catch (Exception e) {
            log.error("Unexpected error occurred while fetching unread notifications for account: {}", accountId, e);
            throw new AppException("Failed to fetch unread notifications");
        }
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(UUID accountId) throws AppException {
        log.debug("Fetching unread count for account with ID: {}", accountId);

        try {
            return notificationRepository.countByAccountIdAndReadFalse(accountId);
        } catch (Exception e) {
            log.error("Unexpected error occurred while fetching unread count for account: {}", accountId, e);
            throw new AppException("Failed to fetch unread count");
        }
    }

    @Transactional
    public void markAsReadByAccountId(UUID notificationId, UUID accountId) throws AppException {
        log.debug("Marking notification with ID: {} as read for account with ID: {}", notificationId, accountId);
        try {
            Notification notification = notificationRepository.findByIdAndAccountId(notificationId, accountId)
                    .orElseThrow(() -> {
                        log.warn("Notification not found with ID: {}", notificationId);
                        return new ResourceNotFoundException("Notification not found");
                    });

            notification.setRead(true);
            notification.setReadAt(Instant.now());
            notificationRepository.save(notification);

            log.info("Marked notification with ID: {} as read for account with ID: {}", notificationId, accountId);
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error occurred while marking notification as read: {}", notificationId, e);
            throw new AppException("Failed to mark notification as read");
        }
    }

    @Transactional
    public long markAllAsRead(UUID accountId) throws AppException {
        log.debug("Marking all notifications for account with ID: {} as read", accountId);

        try {
            return notificationRepository.markAllAsRead(accountId);
        } catch (Exception e) {
            log.error("Unexpected error occurred while marking all notifications for account: {}", accountId, e);
            throw new AppException("Failed to mark all notifications as read");
        }
    }
}
