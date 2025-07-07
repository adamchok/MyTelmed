package com.mytelmed.infrastructure.push.strategy;

import com.mytelmed.infrastructure.push.constant.NotificationType;
import java.util.Map;


public interface PushNotificationStrategy {
    NotificationType getNotificationType();

    void sendNotification(String endpoint, String p256dh, String auth, Map<String, Object> variables);
}
