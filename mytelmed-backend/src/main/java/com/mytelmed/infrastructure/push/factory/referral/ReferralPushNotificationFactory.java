package com.mytelmed.infrastructure.push.factory.referral;

import com.mytelmed.infrastructure.push.constant.NotificationFamily;
import com.mytelmed.infrastructure.push.constant.NotificationType;
import com.mytelmed.infrastructure.push.factory.AbstractPushNotificationFactory;
import com.mytelmed.infrastructure.push.strategy.PushNotificationStrategy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Push notification factory for referral notifications in Malaysian public
 * healthcare telemedicine.
 * Handles referral notification push strategies including creation, acceptance,
 * rejection, and scheduling.
 */
@Slf4j
@Component
public class ReferralPushNotificationFactory extends AbstractPushNotificationFactory {
    private final Map<NotificationType, PushNotificationStrategy> referralPushStrategyMap;

    public ReferralPushNotificationFactory(List<PushNotificationStrategy> strategies) {
        this.referralPushStrategyMap = strategies.stream()
                .filter(strategy -> strategy.getNotificationType().getFamily() == NotificationFamily.REFERRAL)
                .collect(Collectors.toMap(PushNotificationStrategy::getNotificationType, Function.identity()));

        log.info("Initialized ReferralPushNotificationFactory with {} referral push strategies",
                referralPushStrategyMap.size());

        // Log registered strategies for debugging
        referralPushStrategyMap.keySet().forEach(type -> log.debug("Registered referral push strategy for: {}", type));
    }

    @Override
    public boolean supports(NotificationFamily family) {
        return family == NotificationFamily.REFERRAL;
    }

    @Override
    public PushNotificationStrategy getNotificationSender(NotificationType type) {
        return Optional.ofNullable(referralPushStrategyMap.get(type))
                .orElseThrow(() -> {
                    log.error("No push notification sender found for referral type: {}", type);
                    return new IllegalArgumentException("No push notification sender for referral type: " + type);
                });
    }
}