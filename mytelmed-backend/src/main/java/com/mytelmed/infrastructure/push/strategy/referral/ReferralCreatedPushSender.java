package com.mytelmed.infrastructure.push.strategy.referral;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mytelmed.infrastructure.push.config.VapidConfiguration;
import com.mytelmed.infrastructure.push.constant.PushNotificationType;
import com.mytelmed.infrastructure.push.strategy.BasePushNotificationStrategy;
import nl.martijndwars.webpush.PushService;
import org.springframework.stereotype.Component;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

/**
 * Push notification strategy for referral creation events in Malaysian public
 * healthcare telemedicine.
 * Sends push notifications to patients and authorized family members when a new
 * referral is created.
 */
@Component
public class ReferralCreatedPushSender extends BasePushNotificationStrategy {

    public ReferralCreatedPushSender(
            PushService pushService,
            VapidConfiguration vapidConfiguration,
            ObjectMapper objectMapper) {
        super(pushService, vapidConfiguration, objectMapper);
    }

    @Override
    public PushNotificationType getNotificationType() {
        return PushNotificationType.REFERRAL_CREATED;
    }

    @Override
    protected String buildTitle(Map<String, Object> variables) {
        String priority = (String) variables.get("priority");
        String referralType = (String) variables.get("referralType");

        if ("URGENT".equals(priority)) {
            return "🚨 Urgent Referral Created";
        } else if ("EMERGENCY".equals(priority)) {
            return "🚨 Emergency Referral Created";
        }

        String typeDescription = "INTERNAL".equals(referralType) ? "Specialist Referral" : "External Referral";
        return "📋 New " + typeDescription + " Created";
    }

    @Override
    protected String buildBody(Map<String, Object> variables) {
        String referralNumber = (String) variables.get("referralNumber");
        String referringDoctorName = (String) variables.get("referringDoctorName");
        String referralType = (String) variables.get("referralType");
        String priority = (String) variables.get("priority");
        LocalDate expiryDate = (LocalDate) variables.get("expiryDate");

        StringBuilder body = new StringBuilder();

        if ("INTERNAL".equals(referralType)) {
            String referredDoctorName = (String) variables.get("referredDoctorName");
            body.append(String.format("%s has referred you to %s for specialist consultation.",
                    referringDoctorName, referredDoctorName));
        } else {
            String externalDoctorName = (String) variables.get("externalDoctorName");
            String externalFacilityName = (String) variables.get("externalFacilityName");
            body.append(String.format("%s has referred you to %s at %s for external consultation.",
                    referringDoctorName,
                    externalDoctorName != null ? externalDoctorName : "a specialist",
                    externalFacilityName != null ? externalFacilityName : "an external facility"));
        }

        body.append(String.format(" Referral: %s", referralNumber));

        if (expiryDate != null) {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM yyyy");
            body.append(String.format(" (Valid until %s)", expiryDate.format(formatter)));
        }

        return body.toString();
    }

    @Override
    protected Map<String, Object> buildNotificationData(Map<String, Object> variables) {
        Map<String, Object> data = new HashMap<>();
        data.put("type", "referral_created");
        data.put("referralId", variables.get("referralId"));
        data.put("referralNumber", variables.get("referralNumber"));
        data.put("referralType", variables.get("referralType"));
        data.put("priority", variables.get("priority"));

        // Add navigation data
        if ("INTERNAL".equals(variables.get("referralType"))) {
            data.put("navigationUrl", "/patient/referrals");
        } else {
            data.put("navigationUrl", "/patient/referrals");
        }

        return data;
    }

    @Override
    protected void validateRequiredVariables(Map<String, Object> variables) {
        validateRequiredVariable(variables, "referralId", "Referral ID is required");
        validateRequiredVariable(variables, "referralNumber", "Referral number is required");
        validateRequiredVariable(variables, "referralType", "Referral type is required");
        validateRequiredVariable(variables, "priority", "Priority is required");
        validateRequiredVariable(variables, "referringDoctorName", "Referring doctor name is required");
        validateRequiredVariable(variables, "expiryDate", "Expiry date is required");

        // Validate type-specific requirements
        String referralType = (String) variables.get("referralType");
        if ("INTERNAL".equals(referralType)) {
            validateRequiredVariable(variables, "referredDoctorName",
                    "Referred doctor name is required for internal referrals");
        } else if ("EXTERNAL".equals(referralType)) {
            // External doctor name and facility name are optional but preferred
        }
    }

    @Override
    protected boolean requireInteraction() {
        // Make referral notifications require interaction for important medical
        // information
        return true;
    }

    private void validateRequiredVariable(Map<String, Object> variables, String key, String errorMessage) {
        Object value = variables.get(key);
        if (value == null || (value instanceof String && ((String) value).trim().isEmpty())) {
            throw new IllegalArgumentException(errorMessage);
        }
    }
}