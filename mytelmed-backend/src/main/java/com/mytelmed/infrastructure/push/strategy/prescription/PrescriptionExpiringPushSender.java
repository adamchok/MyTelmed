package com.mytelmed.infrastructure.push.strategy.prescription;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mytelmed.infrastructure.push.config.VapidConfiguration;
import com.mytelmed.infrastructure.push.constant.NotificationType;
import com.mytelmed.infrastructure.push.strategy.BasePushNotificationStrategy;
import nl.martijndwars.webpush.PushService;
import org.springframework.stereotype.Component;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Map;


@Component
public class PrescriptionExpiringPushSender extends BasePushNotificationStrategy {
    public PrescriptionExpiringPushSender(
            PushService pushService,
            VapidConfiguration vapidConfiguration,
            ObjectMapper objectMapper) {
        super(pushService, vapidConfiguration, objectMapper);
    }

    @Override
    public NotificationType getNotificationType() {
        return NotificationType.PRESCRIPTION_EXPIRING;
    }

    @Override
    protected String buildTitle(Map<String, Object> variables) {
        return "Prescription Expiring Soon!";
    }

    @Override
    protected String buildBody(Map<String, Object> variables) {
        Instant expiryInstant = (Instant) variables.get("expiryDate");
        ZoneId zoneId = ZoneId.of("Asia/Kuala_Lumpur");
        LocalDate expiryDate = expiryInstant.atZone(zoneId).toLocalDate();

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM yyyy");
        String formattedExpiryDate = expiryDate.format(formatter);

        return String.format(
                "Your prescription is expiring soon. Please take action before %s to avoid delays.",
                formattedExpiryDate);
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
        if (!variables.containsKey("expiryDate")) {
            throw new IllegalArgumentException("expiryDate is required");
        }
        if (!variables.containsKey("daysUntilExpiry")) {
            throw new IllegalArgumentException("daysUntilExpiry is required");
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
