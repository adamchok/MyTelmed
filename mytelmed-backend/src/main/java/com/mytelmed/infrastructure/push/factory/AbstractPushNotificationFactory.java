package com.mytelmed.infrastructure.push.factory;

import com.mytelmed.infrastructure.push.constant.PushNotificationFamily;
import com.mytelmed.infrastructure.push.constant.PushNotificationType;
import com.mytelmed.infrastructure.push.strategy.PushNotificationStrategy;

public abstract class AbstractPushNotificationFactory {
    public abstract boolean supports(PushNotificationFamily family);

    public abstract PushNotificationStrategy getNotificationSender(PushNotificationType type);
}
