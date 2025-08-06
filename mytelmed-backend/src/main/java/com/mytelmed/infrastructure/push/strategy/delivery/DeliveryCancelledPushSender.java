package com.mytelmed.infrastructure.push.strategy.delivery;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mytelmed.infrastructure.push.config.VapidConfiguration;
import com.mytelmed.infrastructure.push.constant.PushNotificationType;
import com.mytelmed.infrastructure.push.strategy.BasePushNotificationStrategy;
import nl.martijndwars.webpush.PushService;
import org.springframework.stereotype.Component;
import java.util.Map;

@Component
public class DeliveryCancelledPushSender extends BasePushNotificationStrategy {

    public DeliveryCancelledPushSender(
            PushService pushService,
            VapidConfiguration vapidConfiguration,
            ObjectMapper objectMapper) {
        super(pushService, vapidConfiguration, objectMapper);
    }

    @Override
    public PushNotificationType getNotificationType() {
        return PushNotificationType.DELIVERY_CANCELLED;
    }

    @Override
    protected String buildTitle(Map<String, Object> variables) {
        return "Delivery Cancelled";
    }

    @Override
    protected String buildBody(Map<String, Object> variables) {
        String deliveryMethod = (String) variables.get("deliveryMethod");
        String cancellationReason = (String) variables.get("cancellationReason");

        String methodText = "HOME_DELIVERY".equals(deliveryMethod) ? "delivery" : "pickup";

        return String.format(
                "Your medication %s has been cancelled. Reason: %s. Please choose a new delivery method or contact support for assistance.",
                methodText, cancellationReason);
    }

    @Override
    protected Map<String, Object> buildNotificationData(Map<String, Object> variables) {
        String prescriptionId = (String) variables.get("prescriptionId");
        String url = String.format("/patient/prescription/%s", prescriptionId);

        return Map.of(
                "url", url,
                "prescriptionId", prescriptionId,
                "deliveryMethod", variables.get("deliveryMethod"),
                "cancellationReason", variables.get("cancellationReason"));
    }

    @Override
    protected void validateRequiredVariables(Map<String, Object> variables) {
        if (!variables.containsKey("prescriptionId")) {
            throw new IllegalArgumentException("prescriptionId is required");
        }
        if (!variables.containsKey("deliveryMethod")) {
            throw new IllegalArgumentException("deliveryMethod is required");
        }
        if (!variables.containsKey("cancellationReason")) {
            throw new IllegalArgumentException("cancellationReason is required");
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
                        "action", "reschedule-delivery",
                        "title", "Reschedule",
                        "icon", "/icons/mytelmed-icon-72.png"),
                Map.of(
                        "action", "contact-support",
                        "title", "Contact Support",
                        "icon", "/icons/mytelmed-icon-72.png")
        };
    }
}