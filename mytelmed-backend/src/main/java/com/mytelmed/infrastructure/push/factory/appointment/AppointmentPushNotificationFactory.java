package com.mytelmed.infrastructure.push.factory.appointment;

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
public class AppointmentPushNotificationFactory extends AbstractPushNotificationFactory {
    private final Map<NotificationType, PushNotificationStrategy> appointmentNotificationStrategyMap;

    public AppointmentPushNotificationFactory(List<PushNotificationStrategy> strategies) {
        this.appointmentNotificationStrategyMap = strategies.stream()
                .filter(strategy -> strategy.getNotificationType().getFamily() == NotificationFamily.APPOINTMENT)
                .collect(Collectors.toMap(PushNotificationStrategy::getNotificationType, Function.identity()));
    }

    @Override
    public boolean supports(NotificationFamily family) {
        return family == NotificationFamily.APPOINTMENT;
    }

    @Override
    public PushNotificationStrategy getNotificationSender(NotificationType type) {
        PushNotificationStrategy strategy = appointmentNotificationStrategyMap.get(type);
        if (strategy == null) {
            throw new IllegalArgumentException("No push notification strategy found for type: " + type);
        }
        return strategy;
    }
}
