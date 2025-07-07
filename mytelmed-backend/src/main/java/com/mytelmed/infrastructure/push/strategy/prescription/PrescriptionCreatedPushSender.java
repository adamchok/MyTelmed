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
public class PrescriptionCreatedPushSender extends BasePushNotificationStrategy {
    public PrescriptionCreatedPushSender(
            PushService pushService,
            VapidConfiguration vapidConfiguration,
            ObjectMapper objectMapper) {
        super(pushService, vapidConfiguration, objectMapper);
    }

    @Override
    public NotificationType getNotificationType() {
        return NotificationType.PRESCRIPTION_CREATED;
    }

    @Override
    protected String buildTitle(Map<String, Object> variables) {
        return "New Prescription Created";
    }

    @Override
    protected String buildBody(Map<String, Object> variables) {
        String doctorName = (String) variables.get("doctorName");
        String facilityName = (String) variables.get("facilityName");

        Instant expiryInstant = (Instant) variables.get("expiryDate");
        ZoneId zoneId = ZoneId.of("Asia/Kuala_Lumpur");
        LocalDate expiryDate = expiryInstant.atZone(zoneId).toLocalDate();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM yyyy");
        String formattedExpiryDate = expiryDate.format(formatter);

        return String.format(
                "Dr. %s at %s has created a new prescription for you. Please review and choose pickup or delivery. Expires: %s",
                doctorName, facilityName, formattedExpiryDate);
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
            throw new IllegalArgumentException("Facility name is required");
        }
        if (!variables.containsKey("doctorName")) {
            throw new IllegalArgumentException("doctorName is required");
        }
        if (!variables.containsKey("expiryDate")) {
            throw new IllegalArgumentException("expiryDate is required");
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
