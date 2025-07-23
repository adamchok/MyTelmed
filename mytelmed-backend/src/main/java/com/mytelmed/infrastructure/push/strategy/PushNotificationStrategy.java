package com.mytelmed.infrastructure.push.strategy;

import com.mytelmed.infrastructure.push.constant.PushNotificationType;
import java.util.Map;

public interface PushNotificationStrategy {
    PushNotificationType getNotificationType();

    void sendNotification(String endpoint, String p256dh, String auth, Map<String, Object> variables);
}
