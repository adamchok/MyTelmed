package com.mytelmed.infrastructure.push.factory.delivery;

import com.mytelmed.infrastructure.push.constant.PushNotificationFamily;
import com.mytelmed.infrastructure.push.constant.PushNotificationType;
import com.mytelmed.infrastructure.push.factory.AbstractPushNotificationFactory;
import com.mytelmed.infrastructure.push.strategy.PushNotificationStrategy;
import lombok.extern.slf4j.Slf4j;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
public class DeliveryPushNotificationFactory extends AbstractPushNotificationFactory {
    private final Map<PushNotificationType, PushNotificationStrategy> deliveryNotificationStrategyMap;

    public DeliveryPushNotificationFactory(List<PushNotificationStrategy> strategies) {
        this.deliveryNotificationStrategyMap = strategies.stream()
                .filter(strategy -> strategy.getNotificationType().getFamily() == PushNotificationFamily.DELIVERY)
                .collect(Collectors.toMap(PushNotificationStrategy::getNotificationType, Function.identity()));

        log.info("Initialized DeliveryPushNotificationFactory with {} strategies: {}",
                deliveryNotificationStrategyMap.size(), deliveryNotificationStrategyMap.keySet());
    }

    @Override
    public boolean supports(PushNotificationFamily family) {
        return family == PushNotificationFamily.DELIVERY;
    }

    @Override
    public PushNotificationStrategy getNotificationSender(PushNotificationType type) {
        PushNotificationStrategy strategy = deliveryNotificationStrategyMap.get(type);
        if (strategy == null) {
            throw new IllegalArgumentException("No push notification strategy found for type: " + type);
        }
        return strategy;
    }
}