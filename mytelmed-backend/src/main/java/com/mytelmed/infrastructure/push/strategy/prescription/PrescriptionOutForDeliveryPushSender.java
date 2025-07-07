package com.mytelmed.infrastructure.push.strategy.prescription;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mytelmed.infrastructure.push.config.VapidConfiguration;
import com.mytelmed.infrastructure.push.constant.NotificationType;
import com.mytelmed.infrastructure.push.strategy.BasePushNotificationStrategy;
import nl.martijndwars.webpush.PushService;
import org.springframework.stereotype.Component;
import java.util.Map;


@Component
public class PrescriptionOutForDeliveryPushSender extends BasePushNotificationStrategy {

    public PrescriptionOutForDeliveryPushSender(
            PushService pushService,
            VapidConfiguration vapidConfiguration,
            ObjectMapper objectMapper) {
        super(pushService, vapidConfiguration, objectMapper);
    }

    @Override
    public NotificationType getNotificationType() {
        return NotificationType.PRESCRIPTION_OUT_FOR_DELIVERY;
    }

    @Override
    protected String buildTitle(Map<String, Object> variables) {
        return "Your Medication is Out for Delivery";
    }

    @Override
    protected String buildBody(Map<String, Object> variables) {
        String facilityName = (String) variables.get("facilityName");

        return String.format(
                "Good news! Your medication from %s is on its way. It typically delivers within 1 to 3 business days.",
                facilityName);
    }

    @Override
    protected Map<String, Object> buildNotificationData(Map<String, Object> variables) {
        String prescriptionId = (String) variables.get("prescriptionId");
        String url = String.format("/patient/prescription/%s", prescriptionId);

        return Map.of("url", url);
    }

    @Override
    protected void validateRequiredVariables(Map<String, Object> variables) {
        if (!variables.containsKey("prescriptionId")) {
            throw new IllegalArgumentException("prescriptionId is required");
        }
        if (!variables.containsKey("facilityName")) {
            throw new IllegalArgumentException("facilityName is required");
        }
    }

    @Override
    protected Map<String, Object>[] buildActions(Map<String, Object> variables) {
        return new Map[]{
                Map.of(
                        "action", "view-prescription",
                        "title", "View Prescription",
                        "icon", "/icons/mytelmed-icon-72.png")
        };
    }
}
