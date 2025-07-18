package com.mytelmed.infrastructure.push.factory.payment;

import com.mytelmed.infrastructure.push.constant.NotificationFamily;
import com.mytelmed.infrastructure.push.constant.NotificationType;
import com.mytelmed.infrastructure.push.factory.AbstractPushNotificationFactory;
import com.mytelmed.infrastructure.push.strategy.PushNotificationStrategy;
import lombok.extern.slf4j.Slf4j;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Push notification factory for payment and billing notifications in Malaysian
 * public
 * healthcare telemedicine.
 * Handles refund and other payment-related push notification strategies.
 */
@Slf4j
public class PaymentPushNotificationFactory extends AbstractPushNotificationFactory {
    private final Map<NotificationType, PushNotificationStrategy> paymentNotificationStrategyMap;

    public PaymentPushNotificationFactory(List<PushNotificationStrategy> strategies) {
        this.paymentNotificationStrategyMap = strategies.stream()
                .filter(strategy -> strategy.getNotificationType().getFamily() == NotificationFamily.PAYMENT)
                .collect(Collectors.toMap(PushNotificationStrategy::getNotificationType, Function.identity()));

        log.info("Initialized PaymentPushNotificationFactory with {} payment notification strategies: {}",
                paymentNotificationStrategyMap.size(), paymentNotificationStrategyMap.keySet());
    }

    @Override
    public boolean supports(NotificationFamily family) {
        return family == NotificationFamily.PAYMENT;
    }

    @Override
    public PushNotificationStrategy getNotificationSender(NotificationType type) {
        PushNotificationStrategy strategy = paymentNotificationStrategyMap.get(type);
        if (strategy == null) {
            throw new IllegalArgumentException("No push notification strategy found for payment type: " + type);
        }
        return strategy;
    }
}
