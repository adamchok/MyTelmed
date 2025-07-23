package com.mytelmed.infrastructure.push.strategy.referral;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mytelmed.infrastructure.push.config.VapidConfiguration;
import com.mytelmed.infrastructure.push.constant.PushNotificationType;
import com.mytelmed.infrastructure.push.strategy.BasePushNotificationStrategy;
import nl.martijndwars.webpush.PushService;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

/**
 * Push notification strategy for referral scheduling events in Malaysian public
 * healthcare telemedicine.
 * Sends push notifications to patients and authorized family members when an
 * appointment is scheduled for a referral.
 */
@Component
public class ReferralScheduledPushSender extends BasePushNotificationStrategy {

    public ReferralScheduledPushSender(
            PushService pushService,
            VapidConfiguration vapidConfiguration,
            ObjectMapper objectMapper) {
        super(pushService, vapidConfiguration, objectMapper);
    }

    @Override
    public PushNotificationType getNotificationType() {
        return PushNotificationType.REFERRAL_SCHEDULED;
    }

    @Override
    protected String buildTitle(Map<String, Object> variables) {
        String consultationMode = (String) variables.get("consultationMode");

        if ("VIRTUAL".equals(consultationMode)) {
            return "📅 Virtual Appointment Scheduled";
        } else {
            return "📅 Physical Appointment Scheduled";
        }
    }

    @Override
    protected String buildBody(Map<String, Object> variables) {
        String referralNumber = (String) variables.get("referralNumber");
        String referredDoctorName = (String) variables.get("referredDoctorName");
        LocalDateTime appointmentDateTime = (LocalDateTime) variables.get("appointmentDateTime");
        String consultationMode = (String) variables.get("consultationMode");
        String facilityName = (String) variables.get("facilityName");

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");
        String formattedDateTime = appointmentDateTime.format(formatter);

        StringBuilder body = new StringBuilder();

        if ("VIRTUAL".equals(consultationMode)) {
            body.append(String.format("Your virtual appointment with %s has been scheduled for %s.",
                    referredDoctorName, formattedDateTime));
            body.append(" You'll receive a video call link before your appointment.");
        } else {
            body.append(String.format("Your appointment with %s has been scheduled for %s",
                    referredDoctorName, formattedDateTime));
            if (facilityName != null) {
                body.append(String.format(" at %s", facilityName));
            }
            body.append(".");
        }

        body.append(String.format(" Referral: %s", referralNumber));

        return body.toString();
    }

    @Override
    protected Map<String, Object> buildNotificationData(Map<String, Object> variables) {
        Map<String, Object> data = new HashMap<>();
        data.put("type", "referral_scheduled");
        data.put("referralId", variables.get("referralId"));
        data.put("referralNumber", variables.get("referralNumber"));
        data.put("appointmentId", variables.get("appointmentId"));
        data.put("consultationMode", variables.get("consultationMode"));

        if (variables.get("appointmentDateTime") != null) {
            data.put("appointmentDateTime", variables.get("appointmentDateTime").toString());
        }

        // Navigation to appointment details
        String appointmentId = (String) variables.get("appointmentId");
        if (appointmentId != null) {
            data.put("navigationUrl", "/patient/appointment/" + appointmentId);
        } else {
            data.put("navigationUrl", "/patient/referrals");
        }

        return data;
    }

    @Override
    protected void validateRequiredVariables(Map<String, Object> variables) {
        validateRequiredVariable(variables, "referralId", "Referral ID is required");
        validateRequiredVariable(variables, "referralNumber", "Referral number is required");
        validateRequiredVariable(variables, "referredDoctorName", "Referred doctor name is required");
        validateRequiredVariable(variables, "appointmentDateTime", "Appointment date and time is required");
        validateRequiredVariable(variables, "consultationMode", "Consultation mode is required");
        validateRequiredVariable(variables, "appointmentId", "Appointment ID is required");

        // facilityName is optional but commonly used in push notifications
    }

    @Override
    protected boolean requireInteraction() {
        // Require interaction as patient may need to prepare for appointment
        return true;
    }

    private void validateRequiredVariable(Map<String, Object> variables, String key, String errorMessage) {
        Object value = variables.get(key);
        if (value == null || (value instanceof String && ((String) value).trim().isEmpty())) {
            throw new IllegalArgumentException(errorMessage);
        }
    }
}