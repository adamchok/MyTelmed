package com.mytelmed.infrastructure.push.strategy;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mytelmed.common.advice.exception.PushNotificationException;
import com.mytelmed.infrastructure.push.config.VapidConfiguration;
import lombok.extern.slf4j.Slf4j;
import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import nl.martijndwars.webpush.Subscription;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.util.StringUtils;
import java.security.NoSuchAlgorithmException;
import java.security.NoSuchProviderException;
import java.security.spec.InvalidKeySpecException;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.CompletableFuture;


@Slf4j
public abstract class BasePushNotificationStrategy implements PushNotificationStrategy {
    protected final PushService pushService;
    protected final VapidConfiguration vapidConfiguration;
    protected final ObjectMapper objectMapper;

    protected BasePushNotificationStrategy(
            PushService pushService,
            VapidConfiguration vapidConfiguration,
            ObjectMapper objectMapper) {
        this.pushService = pushService;
        this.vapidConfiguration = vapidConfiguration;
        this.objectMapper = objectMapper;
    }

    @Override
    @Retryable(retryFor = {PushNotificationException.class}, backoff = @Backoff(delay = 1000, multiplier = 2))
    public void sendNotification(String endpoint, String p256dh, String auth, Map<String, Object> variables) {
        try {
            if (!vapidConfiguration.isPushNotificationsEnabled()) {
                log.debug("Push notifications are disabled. Skipping notification: {}", getNotificationType());
                return;
            }

            validateInput(endpoint, p256dh, auth, variables);

            log.info("Sending {} push notification to endpoint: {}",
                    getNotificationType(), truncateEndpoint(endpoint));

            byte[] payload = buildPayload(variables);
            Subscription subscription = buildSubscription(endpoint, p256dh, auth);

            log.debug("Subscription keys - P256DH: {}, Auth: {}", subscription.keys.p256dh, subscription.keys.auth);
            log.debug("Subscription endpoint: {}", subscription.endpoint);
            log.debug("Payload: {}", payload);

            Notification notification = buildNotification(subscription, payload);

            log.debug("Notification public key: {}", notification.getUserPublicKey());

            sendNotificationAsync(notification, endpoint);

            log.info("Successfully sent {} push notification to endpoint: {}",
                    getNotificationType(), truncateEndpoint(endpoint));

        } catch (Exception e) {
            log.error("Failed to send {} push notification to endpoint: {}",
                    getNotificationType(), truncateEndpoint(endpoint), e);
            throw new PushNotificationException("Failed to send " + getNotificationType() + " push notification", e);
        }
    }

    protected void validateInput(String endpoint, String p256dh, String auth, Map<String, Object> variables) {
        if (!StringUtils.hasText(endpoint)) {
            throw new IllegalArgumentException("Push notification endpoint cannot be null or empty");
        }

        if (!StringUtils.hasText(p256dh)) {
            throw new IllegalArgumentException("P256DH key cannot be null or empty");
        }

        if (!StringUtils.hasText(auth)) {
            throw new IllegalArgumentException("Auth key cannot be null or empty");
        }

        // Validate that keys are properly base64 encoded
        try {
            java.util.Base64.getDecoder().decode(p256dh);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("P256DH key is not valid base64: " + e.getMessage());
        }

        try {
            java.util.Base64.getDecoder().decode(auth);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Auth key is not valid base64: " + e.getMessage());
        }

        if (variables == null) {
            throw new IllegalArgumentException("Notification variables cannot be null");
        }

        validateRequiredVariables(variables);
    }

    protected byte[] buildPayload(Map<String, Object> variables) {
        try {
            Map<String, Object> payload = Map.of(
                    "title", buildTitle(variables),
                    "body", buildBody(variables),
                    "icon", getIconUrl(),
                    "badge", getBadgeUrl(),
                    "data", buildNotificationData(variables),
                    "timestamp", Instant.now().toEpochMilli(),
                    "requireInteraction", requireInteraction(),
                    "silent", isSilent(),
                    "tag", getNotificationTag(),
                    "actions", buildActions(variables));

            return objectMapper.writeValueAsBytes(payload);
        } catch (Exception e) {
            throw new PushNotificationException("Failed to build notification payload", e);
        }
    }

    protected Subscription buildSubscription(String endpoint, String p256dh, String auth) {
        try {
            // Validate and normalize the keys
            String normalizedP256dh = normalizeBase64Key(p256dh, "P256DH");
            String normalizedAuth = normalizeBase64Key(auth, "Auth");

            // Additional validation for key lengths after decoding
            byte[] p256dhBytes = java.util.Base64.getUrlDecoder().decode(normalizedP256dh);
            byte[] authBytes = java.util.Base64.getUrlDecoder().decode(normalizedAuth);

            if (p256dhBytes.length != 65) {
                throw new IllegalArgumentException(
                        "P256DH key must be 65 bytes when decoded, got: " + p256dhBytes.length);
            }

            if (authBytes.length != 16) {
                throw new IllegalArgumentException("Auth key must be 16 bytes when decoded, got: " + authBytes.length);
            }

            log.debug("Building subscription with normalized keys - P256DH: {} chars, Auth: {} chars",
                    normalizedP256dh.length(), normalizedAuth.length());

            return new Subscription(endpoint, new Subscription.Keys(normalizedP256dh, normalizedAuth));
        } catch (Exception e) {
            log.error("Failed to build subscription for endpoint: {}. Error: {}", truncateEndpoint(endpoint),
                    e.getMessage());
            throw new IllegalArgumentException("Invalid subscription keys: " + e.getMessage(), e);
        }
    }

    private String normalizeBase64Key(String key, String keyType) {
        if (key == null || key.trim().isEmpty()) {
            throw new IllegalArgumentException(keyType + " key cannot be null or empty");
        }

        try {
            // Remove any whitespace
            String cleanKey = key.trim();

            // Try to decode with standard Base64 first
            byte[] keyBytes;
            try {
                keyBytes = java.util.Base64.getDecoder().decode(cleanKey);
            } catch (IllegalArgumentException e1) {
                // If standard Base64 fails, try URL-safe Base64
                try {
                    keyBytes = java.util.Base64.getUrlDecoder().decode(cleanKey);
                } catch (IllegalArgumentException e2) {
                    // If both fail, try adding padding if needed
                    String paddedKey = addPaddingIfNeeded(cleanKey);
                    try {
                        keyBytes = java.util.Base64.getDecoder().decode(paddedKey);
                    } catch (IllegalArgumentException e3) {
                        keyBytes = java.util.Base64.getUrlDecoder().decode(paddedKey);
                    }
                }
            }

            // Re-encode as URL-safe Base64 without padding (which is what web push expects)
            return java.util.Base64.getUrlEncoder().withoutPadding().encodeToString(keyBytes);

        } catch (Exception e) {
            throw new IllegalArgumentException(keyType + " key is not valid base64: " + e.getMessage(), e);
        }
    }

    private String addPaddingIfNeeded(String base64) {
        int padding = 4 - (base64.length() % 4);
        if (padding != 4) {
            return base64 + "=".repeat(padding);
        }
        return base64;
    }

    protected Notification buildNotification(Subscription subscription, byte[] payload)
            throws NoSuchAlgorithmException, InvalidKeySpecException, NoSuchProviderException {
        return Notification.builder()
                .endpoint(subscription.endpoint)
                .userPublicKey(subscription.keys.p256dh)
                .userAuth(subscription.keys.auth)
                .payload(payload)
                .build();
    }

    protected void sendNotificationAsync(Notification notification, String endpoint) {
        CompletableFuture.runAsync(() -> {
            try {
                log.debug("Attempting to send push notification to endpoint: {}", truncateEndpoint(endpoint));
                pushService.send(notification);
                log.debug("Successfully sent push notification to endpoint: {}", truncateEndpoint(endpoint));
            } catch (Exception e) {
                log.error("Push notification sending failed for endpoint: {}. Error: {}",
                        truncateEndpoint(endpoint), e.getMessage(), e);

                // Check for specific encryption-related errors
                if (e.getMessage() != null && e.getMessage().contains("context")) {
                    log.error(
                            "Encryption context error - this usually indicates invalid subscription keys (p256dh/auth) for endpoint: {}",
                            truncateEndpoint(endpoint));
                }

                throw new PushNotificationException("Failed to send push notification", e);
            }
        }).exceptionally(throwable -> {
            log.error("Async push notification failed for endpoint: {}", truncateEndpoint(endpoint), throwable);
            return null;
        });
    }

    protected String truncateEndpoint(String endpoint) {
        if (endpoint.length() > 50) {
            return endpoint.substring(0, 50) + "...";
        }
        return endpoint;
    }

    protected abstract String buildTitle(Map<String, Object> variables);

    protected abstract String buildBody(Map<String, Object> variables);

    protected abstract Map<String, Object> buildNotificationData(Map<String, Object> variables);

    protected abstract void validateRequiredVariables(Map<String, Object> variables);

    protected String getIconUrl() {
        return "/icons/mytelmed-icon-192.png";
    }

    protected String getBadgeUrl() {
        return "/icons/mytelmed-badge-72.png";
    }

    protected boolean requireInteraction() {
        return false;
    }

    protected boolean isSilent() {
        return false;
    }

    protected String getNotificationTag() {
        return getNotificationType().name();
    }

    protected Map<String, Object>[] buildActions(Map<String, Object> variables) {
        return new Map[0];
    }
}
