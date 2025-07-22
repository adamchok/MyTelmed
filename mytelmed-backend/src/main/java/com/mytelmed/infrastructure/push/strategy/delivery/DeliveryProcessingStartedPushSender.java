package com.mytelmed.infrastructure.push.strategy.delivery;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mytelmed.infrastructure.push.config.VapidConfiguration;
import com.mytelmed.infrastructure.push.constant.NotificationType;
import com.mytelmed.infrastructure.push.strategy.BasePushNotificationStrategy;
import nl.martijndwars.webpush.PushService;
import org.springframework.stereotype.Component;
import java.util.Map;

@Component
public class DeliveryProcessingStartedPushSender extends BasePushNotificationStrategy {

    public DeliveryProcessingStartedPushSender(
            PushService pushService,
            VapidConfiguration vapidConfiguration,
            ObjectMapper objectMapper) {
        super(pushService, vapidConfiguration, objectMapper);
    }

    @Override
    public NotificationType getNotificationType() {
        return NotificationType.DELIVERY_PROCESSING_STARTED;
    }

    @Override
    protected String buildTitle(Map<String, Object> variables) {
        String deliveryMethod = (String) variables.get("deliveryMethod");
        if ("HOME_DELIVERY".equals(deliveryMethod)) {
            return "Preparing Your Delivery";
        } else {
            return "Preparing Your Pickup";
        }
    }

    @Override
    protected String buildBody(Map<String, Object> variables) {
        String deliveryMethod = (String) variables.get("deliveryMethod");

        if ("HOME_DELIVERY".equals(deliveryMethod)) {
            return "Good news! Our pharmacist has started preparing your medication for home delivery. You'll receive an update when it's ready to be shipped.";
        } else {
            return "Good news! Our pharmacist has started preparing your medication for pickup. You'll receive an update when it's ready for collection.";
        }
    }

    @Override
    protected Map<String, Object> buildNotificationData(Map<String, Object> variables) {
        String prescriptionId = (String) variables.get("prescriptionId");
        String url = String.format("/patient/delivery");

        return Map.of(
                "url", url,
                "prescriptionId", prescriptionId,
                "deliveryMethod", variables.get("deliveryMethod"));
    }

    @Override
    protected void validateRequiredVariables(Map<String, Object> variables) {
        if (!variables.containsKey("prescriptionId")) {
            throw new IllegalArgumentException("prescriptionId is required");
        }
        if (!variables.containsKey("deliveryMethod")) {
            throw new IllegalArgumentException("deliveryMethod is required");
        }
    }

    @Override
    protected boolean requireInteraction() {
        return false;
    }

    @Override
    protected Map<String, Object>[] buildActions(Map<String, Object> variables) {
        return new Map[] {
                Map.of(
                        "action", "track-delivery",
                        "title", "Track Progress",
                        "icon", "/icons/mytelmed-icon-72.png"),
                Map.of(
                        "action", "view-details",
                        "title", "View Details",
                        "icon", "/icons/mytelmed-icon-72.png")
        };
    }
}