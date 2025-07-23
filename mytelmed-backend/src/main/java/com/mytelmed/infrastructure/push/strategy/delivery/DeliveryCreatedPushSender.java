package com.mytelmed.infrastructure.push.strategy.delivery;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mytelmed.infrastructure.push.config.VapidConfiguration;
import com.mytelmed.infrastructure.push.constant.PushNotificationType;
import com.mytelmed.infrastructure.push.strategy.BasePushNotificationStrategy;
import nl.martijndwars.webpush.PushService;
import org.springframework.stereotype.Component;
import java.util.Map;

@Component
public class DeliveryCreatedPushSender extends BasePushNotificationStrategy {

    public DeliveryCreatedPushSender(
            PushService pushService,
            VapidConfiguration vapidConfiguration,
            ObjectMapper objectMapper) {
        super(pushService, vapidConfiguration, objectMapper);
    }

    @Override
    public PushNotificationType getNotificationType() {
        return PushNotificationType.DELIVERY_CREATED;
    }

    @Override
    protected String buildTitle(Map<String, Object> variables) {
        return "Delivery Confirmed";
    }

    @Override
    protected String buildBody(Map<String, Object> variables) {
        String deliveryMethod = (String) variables.get("deliveryMethod");
        String facilityName = (String) variables.get("facilityName");

        if ("HOME_DELIVERY".equals(deliveryMethod)) {
            return String.format(
                    "Your medication delivery from %s has been confirmed. We'll prepare your prescription for home delivery within 1-3 business days.",
                    facilityName);
        } else {
            return String.format(
                    "Your medication pickup from %s has been confirmed. Your prescription will be ready for collection within 1-2 business days.",
                    facilityName);
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
        if (!variables.containsKey("facilityName")) {
            throw new IllegalArgumentException("facilityName is required");
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
                        "title", "Track Delivery",
                        "icon", "/icons/mytelmed-icon-72.png"),
                Map.of(
                        "action", "view-details",
                        "title", "View Details",
                        "icon", "/icons/mytelmed-icon-72.png")
        };
    }
}