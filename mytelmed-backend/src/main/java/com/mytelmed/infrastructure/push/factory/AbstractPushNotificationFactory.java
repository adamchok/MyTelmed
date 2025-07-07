package com.mytelmed.infrastructure.push.factory;


import com.mytelmed.infrastructure.push.constant.NotificationFamily;
import com.mytelmed.infrastructure.push.constant.NotificationType;
import com.mytelmed.infrastructure.push.strategy.PushNotificationStrategy;


public abstract class AbstractPushNotificationFactory {
    public abstract boolean supports(NotificationFamily family);

    public abstract PushNotificationStrategy getNotificationSender(NotificationType type);
}
