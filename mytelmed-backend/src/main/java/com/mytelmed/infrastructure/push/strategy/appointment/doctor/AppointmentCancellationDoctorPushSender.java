package com.mytelmed.infrastructure.push.strategy.appointment.doctor;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mytelmed.infrastructure.push.config.VapidConfiguration;
import com.mytelmed.infrastructure.push.constant.NotificationType;
import com.mytelmed.infrastructure.push.strategy.BasePushNotificationStrategy;
import nl.martijndwars.webpush.PushService;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;


@Component
public class AppointmentCancellationDoctorPushSender extends BasePushNotificationStrategy {

    public AppointmentCancellationDoctorPushSender(
            PushService pushService,
            VapidConfiguration vapidConfiguration,
            ObjectMapper objectMapper) {
        super(pushService, vapidConfiguration, objectMapper);
    }

    @Override
    public NotificationType getNotificationType() {
        return NotificationType.APPOINTMENT_CANCEL_PROVIDER;
    }

    @Override
    protected String buildTitle(Map<String, Object> variables) {
        return "Appointment Cancelled";
    }

    @Override
    protected String buildBody(Map<String, Object> variables) {
        String patientName = (String) variables.get("patientName");

        LocalDateTime appointmentDateTime = (LocalDateTime) variables.get("appointmentDateTime");
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");
        String formattedDateTime = appointmentDateTime.format(formatter);

        return String.format("Patient %s cancelled their appointment scheduled for %s.",
                patientName, formattedDateTime);
    }

    @Override
    protected Map<String, Object> buildNotificationData(Map<String, Object> variables) {
        String appointmentId = (String) variables.get("appointmentId");
        String url = String.format("/doctor/appointment/%s", appointmentId);

        return Map.of("url", url);
    }

    @Override
    protected void validateRequiredVariables(Map<String, Object> variables) {
        if (!variables.containsKey("appointmentId")) {
            throw new IllegalArgumentException("appointmentId is required");
        }
        if (!variables.containsKey("patientName")) {
            throw new IllegalArgumentException("inviterName is required");
        }
        if (!variables.containsKey("appointmentDateTime")) {
            throw new IllegalArgumentException("appointmentDateTime is required");
        }
    }

    @Override
    protected Map<String, Object>[] buildActions(Map<String, Object> variables) {
        return new Map[]{
                Map.of(
                        "action", "view-appointment",
                        "title", "View Appointment",
                        "icon", "/icons/mytelmed-icon-72.png")
        };
    }
}
