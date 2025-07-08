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
        String consultationMode = (String) variables.get("consultationMode");

        LocalDateTime appointmentDateTime = (LocalDateTime) variables.get("appointmentDateTime");
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");
        String formattedDateTime = appointmentDateTime.format(formatter);

        String appointmentType = consultationMode.equals("VIRTUAL") ? "virtual" : "physical";

        return String.format(
                "The %s appointment with %s scheduled for %s has been cancelled.",
                appointmentType, patientName, formattedDateTime);
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
            throw new IllegalArgumentException("patientName is required");
        }
        if (!variables.containsKey("appointmentDateTime")) {
            throw new IllegalArgumentException("appointmentDateTime is required");
        }
        if (!variables.containsKey("consultationMode")) {
            throw new IllegalArgumentException("consultationMode is required");
        }
    }

    @Override
    protected Map<String, Object>[] buildActions(Map<String, Object> variables) {
        return new Map[] {
                Map.of(
                        "action", "view-appointment",
                        "title", "View Appointment",
                        "icon", "/icons/mytelmed-icon-72.png")
        };
    }
}
