package com.mytelmed.infrastructure.push.factory.prescription;

import com.mytelmed.infrastructure.push.constant.NotificationFamily;
import com.mytelmed.infrastructure.push.constant.NotificationType;
import com.mytelmed.infrastructure.push.factory.AbstractPushNotificationFactory;
import com.mytelmed.infrastructure.push.strategy.PushNotificationStrategy;
import lombok.extern.slf4j.Slf4j;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;


@Slf4j
public class PrescriptionPushNotificationFactory extends AbstractPushNotificationFactory {
    private final Map<NotificationType, PushNotificationStrategy> prescriptionNotificationStrategyMap;

    public PrescriptionPushNotificationFactory(List<PushNotificationStrategy> strategies) {
        this.prescriptionNotificationStrategyMap = strategies.stream()
                .filter(strategy -> strategy.getNotificationType().getFamily() == NotificationFamily.PRESCRIPTION)
                .collect(Collectors.toMap(PushNotificationStrategy::getNotificationType, Function.identity()));
    }

    @Override
    public boolean supports(NotificationFamily family) {
        return family == NotificationFamily.PRESCRIPTION;
    }

    @Override
    public PushNotificationStrategy getNotificationSender(NotificationType type) {
        PushNotificationStrategy strategy = prescriptionNotificationStrategyMap.get(type);
        if (strategy == null) {
            throw new IllegalArgumentException("No push notification strategy found for type: " + type);
        }
        return strategy;
    }
}
