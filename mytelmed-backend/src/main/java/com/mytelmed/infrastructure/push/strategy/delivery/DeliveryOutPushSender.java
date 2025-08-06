package com.mytelmed.infrastructure.push.strategy.delivery;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mytelmed.infrastructure.push.config.VapidConfiguration;
import com.mytelmed.infrastructure.push.constant.PushNotificationType;
import com.mytelmed.infrastructure.push.strategy.BasePushNotificationStrategy;
import nl.martijndwars.webpush.PushService;
import org.springframework.stereotype.Component;
import java.util.Map;

@Component
public class DeliveryOutPushSender extends BasePushNotificationStrategy {

    public DeliveryOutPushSender(
            PushService pushService,
            VapidConfiguration vapidConfiguration,
            ObjectMapper objectMapper) {
        super(pushService, vapidConfiguration, objectMapper);
    }

    @Override
    public PushNotificationType getNotificationType() {
        return PushNotificationType.DELIVERY_OUT;
    }

    @Override
    protected String buildTitle(Map<String, Object> variables) {
        return "Medication Out for Delivery";
    }

    @Override
    protected String buildBody(Map<String, Object> variables) {
        String courierName = (String) variables.get("courierName");
        String trackingReference = (String) variables.get("trackingReference");

        return String.format(
                "Great news! Your medication is now out for delivery with %s. Track your package using reference: %s",
                courierName, trackingReference);
    }

    @Override
    protected Map<String, Object> buildNotificationData(Map<String, Object> variables) {
        String prescriptionId = (String) variables.get("prescriptionId");
        String trackingReference = (String) variables.get("trackingReference");
        String url = String.format("/patient/prescription/%s", prescriptionId);

        return Map.of(
                "url", url,
                "prescriptionId", prescriptionId,
                "trackingReference", trackingReference,
                "courierName", variables.get("courierName"));
    }

    @Override
    protected void validateRequiredVariables(Map<String, Object> variables) {
        if (!variables.containsKey("prescriptionId")) {
            throw new IllegalArgumentException("prescriptionId is required");
        }
        if (!variables.containsKey("trackingReference")) {
            throw new IllegalArgumentException("trackingReference is required");
        }
        if (!variables.containsKey("courierName")) {
            throw new IllegalArgumentException("courierName is required");
        }
    }

    @Override
    protected boolean requireInteraction() {
        return true;
    }

    @Override
    protected Map<String, Object>[] buildActions(Map<String, Object> variables) {
        return new Map[] {
                Map.of(
                        "action", "track-package",
                        "title", "Track Package",
                        "icon", "/icons/mytelmed-icon-72.png"),
                Map.of(
                        "action", "contact-support",
                        "title", "Contact Support",
                        "icon", "/icons/mytelmed-icon-72.png")
        };
    }
}