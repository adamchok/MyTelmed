package com.mytelmed.infrastructure.push.strategy.delivery;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mytelmed.infrastructure.push.config.VapidConfiguration;
import com.mytelmed.infrastructure.push.constant.PushNotificationType;
import com.mytelmed.infrastructure.push.strategy.BasePushNotificationStrategy;
import nl.martijndwars.webpush.PushService;
import org.springframework.stereotype.Component;
import java.util.Map;


@Component
public class DeliveryReadyForPickupPushSender extends BasePushNotificationStrategy {

    public DeliveryReadyForPickupPushSender(
            PushService pushService,
            VapidConfiguration vapidConfiguration,
            ObjectMapper objectMapper) {
        super(pushService, vapidConfiguration, objectMapper);
    }

    @Override
    public PushNotificationType getNotificationType() {
        return PushNotificationType.DELIVERY_READY_FOR_PICKUP;
    }

    @Override
    protected String buildTitle(Map<String, Object> variables) {
        return "Medication Ready for Pickup";
    }

    @Override
    protected String buildBody(Map<String, Object> variables) {
        String prescriptionNumber = (String) variables.get("prescriptionNumber");

        return String.format(
                "Great news! Your medication is ready for pickup. Track your prescription using reference: %s", prescriptionNumber);
    }

    @Override
    protected Map<String, Object> buildNotificationData(Map<String, Object> variables) {
        String prescriptionId = (String) variables.get("prescriptionId");
        String prescriptionNumber = (String) variables.get("prescriptionNumber");
        String url = "/patient/prescription";

        return Map.of(
                "url", url,
                "prescriptionId", prescriptionId,
                "prescriptionNumber", prescriptionNumber);
    }

    @Override
    protected void validateRequiredVariables(Map<String, Object> variables) {
        if (!variables.containsKey("prescriptionId")) {
            throw new IllegalArgumentException("prescriptionId is required");
        }
        if (!variables.containsKey("prescriptionNumber")) {
            throw new IllegalArgumentException("prescriptionNumber is required");
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
                        "action", "track-prescription",
                        "title", "Track Prescription",
                        "icon", "/icons/mytelmed-icon-72.png"),
        };
    }
}