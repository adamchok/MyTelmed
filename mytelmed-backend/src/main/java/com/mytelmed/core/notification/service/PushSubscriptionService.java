package com.mytelmed.core.notification.service;

import com.mytelmed.common.advice.AppException;
import com.mytelmed.common.advice.exception.ResourceNotFoundException;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.notification.dto.PushSubscriptionRequestDto;
import com.mytelmed.core.notification.entity.PushSubscription;
import com.mytelmed.core.notification.repository.PushSubscriptionRepository;
import com.mytelmed.infrastructure.push.constant.PushNotificationType;
import com.mytelmed.infrastructure.push.factory.PushNotificationFactoryRegistry;
import com.mytelmed.infrastructure.push.strategy.PushNotificationStrategy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
public class PushSubscriptionService {
    private final PushSubscriptionRepository subscriptionRepository;
    private final PushNotificationFactoryRegistry notificationRegistry;
    private final static int MAX_SUBSCRIPTIONS_PER_USER = 10;

    public PushSubscriptionService(PushSubscriptionRepository subscriptionRepository,
            PushNotificationFactoryRegistry notificationRegistry) {
        this.subscriptionRepository = subscriptionRepository;
        this.notificationRegistry = notificationRegistry;
    }

    @Transactional
    public void subscribe(Account account, PushSubscriptionRequestDto request) throws AppException {
        log.info("Creating push subscription for account: {} ({})", account.getId(), account.getPermission().getType());

        // Validate subscription keys
        validateSubscriptionKeys(request.p256dh(), request.auth());

        // Check if a subscription already exists
        if (subscriptionRepository.existsByAccountIdAndEndpointAndIsActiveTrue(account.getId(), request.endpoint())) {
            log.info("Push subscription already exists for account: {} and endpoint", account.getId());
            PushSubscription existing = subscriptionRepository
                    .findByAccountIdAndEndpointAndIsActiveTrue(account.getId(), request.endpoint())
                    .orElseThrow();

            // Update existing subscription
            existing.setUserAgent(request.userAgent());
            existing.setDeviceInfo(request.deviceInfo());

            // Update keys in case they changed
            existing.setP256dh(request.p256dh());
            existing.setAuth(request.auth());
            return;
        }

        // Check subscription limit
        long activeSubscriptions = subscriptionRepository.countActiveSubscriptionsByAccountId(account.getId());
        if (activeSubscriptions >= MAX_SUBSCRIPTIONS_PER_USER) {
            log.warn("Account {} has reached maximum subscription limit: {}", account.getId(),
                    MAX_SUBSCRIPTIONS_PER_USER);
            throw new AppException("Maximum number of push subscriptions reached");
        }

        try {
            // Create a new subscription
            PushSubscription subscription = PushSubscription.builder()
                    .account(account)
                    .endpoint(request.endpoint())
                    .p256dh(request.p256dh())
                    .auth(request.auth())
                    .userAgent(request.userAgent())
                    .deviceInfo(request.deviceInfo())
                    .lastUsedAt(Instant.now())
                    .build();

            // Save the new subscription
            subscriptionRepository.save(subscription);

            log.info("Successfully created push subscription for account: {}", account.getId());
        } catch (Exception e) {
            log.error("Failed to create push subscription for account: {} ({})", account.getId(),
                    account.getPermission().getType(), e);
            throw e;
        }
    }

    private void validateSubscriptionKeys(String p256dh, String auth) throws AppException {
        if (p256dh == null || p256dh.trim().isEmpty()) {
            throw new AppException("P256DH key cannot be null or empty");
        }

        if (auth == null || auth.trim().isEmpty()) {
            throw new AppException("Auth key cannot be null or empty");
        }

        // Validate that keys are properly base64 encoded
        try {
            java.util.Base64.getDecoder().decode(p256dh);
        } catch (IllegalArgumentException e) {
            log.error("Invalid P256DH key format: {}", e.getMessage());
            throw new AppException("P256DH key is not valid base64 format");
        }

        try {
            java.util.Base64.getDecoder().decode(auth);
        } catch (IllegalArgumentException e) {
            log.error("Invalid Auth key format: {}", e.getMessage());
            throw new AppException("Auth key is not valid base64 format");
        }
    }

    @Transactional
    public void unsubscribe(Account account, String endpoint) throws AppException {
        log.info("Unsubscribing account: {} from endpoint", account.getId());

        // Find subscription
        PushSubscription subscription = subscriptionRepository
                .findByAccountIdAndEndpointAndIsActiveTrue(account.getId(), endpoint)
                .orElseThrow(() -> {
                    log.warn("Subscription not found for account: {} and endpoint: {}", account.getId(), endpoint);
                    return new ResourceNotFoundException("Subscription not found");
                });

        // Soft delete subscription
        subscription.setIsActive(false);

        // Save subscription
        subscriptionRepository.save(subscription);

        log.info("Successfully unsubscribed account {} from endpoint {}", account.getId(), endpoint);
    }

    @Transactional
    public void unsubscribeAllByAccountId(UUID accountId) throws AppException {
        log.info("Unsubscribing all subscriptions for account: {}", accountId);
        int deactivationCount = subscriptionRepository.deactivateAllSubscriptionsByAccountId(accountId);
        log.info("Deactivated {} subscriptions for user: {}", deactivationCount, accountId);
    }

    @Async
    @Transactional
    public void sendNotificationByAccountId(UUID accountId, PushNotificationType notificationType,
            Map<String, Object> variables) {
        try {
            // Validate inputs
            if (accountId == null) {
                log.warn("Cannot send push notification: account ID is null for type: {}", notificationType);
                return;
            }

            if (notificationType == null) {
                log.warn("Cannot send push notification: notification type is null for account: {}", accountId);
                return;
            }

            if (variables == null) {
                log.warn("Cannot send push notification: variables are null for account: {} and type: {}",
                        accountId, notificationType);
                return;
            }

            // Find all active subscriptions by account ID
            List<PushSubscription> subscriptions = subscriptionRepository.findByAccountIdAndIsActiveTrue(accountId);

            // Verify if there are any active subscriptions
            if (subscriptions.isEmpty()) {
                log.debug("No active push subscriptions found for account: {}", accountId);
                return;
            }

            log.info("Sending {} push notification to {} subscriptions for account: {}",
                    notificationType, subscriptions.size(), accountId);

            // Send notification for each active subscriptions
            subscriptions.forEach(subscription -> {
                try {
                    // Send notification
                    sendNotificationToSubscription(subscription, notificationType, variables);

                    // Update last used timestamp in a separate transaction
                    updateSubscriptionLastUsed(subscription.getId());
                } catch (Exception e) {
                    log.error("Failed to send push notification to subscription: {}",
                            subscription.getId(), e);

                    // Deactivate invalid subscriptions
                    if (isSubscriptionInvalid(e)) {
                        deactivateInvalidSubscription(subscription.getEndpoint());
                        log.info("Deactivated invalid subscription: {}", subscription.getId());
                    }
                }
            });
        } catch (Exception e) {
            log.error("Failed to send push notifications to account: {}", accountId, e);
        }
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void updateSubscriptionLastUsed(UUID subscriptionId) {
        try {
            subscriptionRepository.updateLastUsedAtById(subscriptionId, Instant.now());
        } catch (Exception e) {
            log.error("Failed to update last used timestamp for subscription: {}", subscriptionId, e);
        }
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void deactivateInvalidSubscription(String endpoint) {
        try {
            subscriptionRepository.deactivateSubscriptionByEndpoint(endpoint);
        } catch (Exception e) {
            log.error("Failed to deactivate subscription with endpoint: {}", endpoint, e);
        }
    }

    private void sendNotificationToSubscription(PushSubscription subscription, PushNotificationType notificationType,
            Map<String, Object> variables) {
        log.debug("Sending {} notification to subscription: {}", notificationType, subscription.getId());

        try {
            // Validate subscription keys before sending
            if (subscription.getP256dh() == null || subscription.getP256dh().trim().isEmpty()) {
                log.error("Subscription {} has null or empty P256DH key", subscription.getId());
                throw new IllegalArgumentException(
                        "P256DH key is null or empty for subscription " + subscription.getId());
            }

            if (subscription.getAuth() == null || subscription.getAuth().trim().isEmpty()) {
                log.error("Subscription {} has null or empty Auth key", subscription.getId());
                throw new IllegalArgumentException(
                        "Auth key is null or empty for subscription " + subscription.getId());
            }

            log.debug("Sending notification to endpoint: {} with P256DH length: {}, Auth length: {}",
                    subscription.getEndpoint().substring(0, Math.min(50, subscription.getEndpoint().length())) + "...",
                    subscription.getP256dh().length(),
                    subscription.getAuth().length());

            // Get the correct notification strategy
            PushNotificationStrategy strategy = notificationRegistry.getNotificationSender(notificationType);

            // Send notification
            strategy.sendNotification(
                    subscription.getEndpoint(),
                    subscription.getP256dh(),
                    subscription.getAuth(),
                    variables);

            log.debug("Successfully sent {} notification to subscription: {}", notificationType, subscription.getId());
        } catch (Exception e) {
            log.error("Failed to send notification {} to subscription: {}", notificationType, subscription.getId(), e);
            throw e;
        }
    }

    /**
     * Check if the exception indicates an invalid subscription (410 Gone, etc.)
     */
    private boolean isSubscriptionInvalid(Exception e) {
        String message = e.getMessage();
        return message != null && (message.contains("410") ||
                message.contains("Gone") ||
                message.contains("invalid") ||
                message.contains("expired"));
    }
}
