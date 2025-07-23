package com.mytelmed.infrastructure.push.strategy.delivery;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mytelmed.infrastructure.push.config.VapidConfiguration;
import com.mytelmed.infrastructure.push.constant.PushNotificationType;
import com.mytelmed.infrastructure.push.strategy.BasePushNotificationStrategy;
import nl.martijndwars.webpush.PushService;
import org.springframework.stereotype.Component;
import java.util.Map;

@Component
public class DeliveryCompletedPushSender extends BasePushNotificationStrategy {

    public DeliveryCompletedPushSender(
            PushService pushService,
            VapidConfiguration vapidConfiguration,
            ObjectMapper objectMapper) {
        super(pushService, vapidConfiguration, objectMapper);
    }

    @Override
    public PushNotificationType getNotificationType() {
        return PushNotificationType.DELIVERY_COMPLETED;
    }

    @Override
    protected String buildTitle(Map<String, Object> variables) {
        String deliveryMethod = (String) variables.get("deliveryMethod");
        if ("PICKUP".equals(deliveryMethod)) {
            return "Medication Successfully Picked Up";
        } else {
            return "Medication Successfully Delivered";
        }
    }

    @Override
    protected String buildBody(Map<String, Object> variables) {
        String deliveryMethod = (String) variables.get("deliveryMethod");

        if ("PICKUP".equals(deliveryMethod)) {
            return "Your medication has been successfully picked up from the pharmacy. Please follow the prescribed instructions and contact your doctor if you have any concerns.";
        } else {
            return "Your medication has been successfully delivered to your address. Please follow the prescribed instructions and contact your doctor if you have any concerns.";
        }
    }

    @Override
    protected Map<String, Object> buildNotificationData(Map<String, Object> variables) {
        String prescriptionId = (String) variables.get("prescriptionId");
        String url = String.format("/patient/prescription/%s", prescriptionId);

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
                        "action", "view-prescription",
                        "title", "View Prescription",
                        "icon", "/icons/mytelmed-icon-72.png"),
                Map.of(
                        "action", "give-feedback",
                        "title", "Give Feedback",
                        "icon", "/icons/mytelmed-icon-72.png")
        };
    }
}