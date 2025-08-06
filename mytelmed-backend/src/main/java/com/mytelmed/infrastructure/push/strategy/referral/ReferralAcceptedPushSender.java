package com.mytelmed.infrastructure.push.strategy.referral;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mytelmed.infrastructure.push.config.VapidConfiguration;
import com.mytelmed.infrastructure.push.constant.PushNotificationType;
import com.mytelmed.infrastructure.push.strategy.BasePushNotificationStrategy;
import nl.martijndwars.webpush.PushService;
import org.springframework.stereotype.Component;
import java.util.HashMap;
import java.util.Map;

/**
 * Push notification strategy for referral acceptance events in Malaysian public
 * healthcare telemedicine.
 * Sends push notifications to patients and authorized family members when a
 * referral is accepted by the referred doctor.
 */
@Component
public class ReferralAcceptedPushSender extends BasePushNotificationStrategy {

    public ReferralAcceptedPushSender(
            PushService pushService,
            VapidConfiguration vapidConfiguration,
            ObjectMapper objectMapper) {
        super(pushService, vapidConfiguration, objectMapper);
    }

    @Override
    public PushNotificationType getNotificationType() {
        return PushNotificationType.REFERRAL_ACCEPTED;
    }

    @Override
    protected String buildTitle(Map<String, Object> variables) {
        return "✅ Referral Accepted";
    }

    @Override
    protected String buildBody(Map<String, Object> variables) {
        String referralNumber = (String) variables.get("referralNumber");
        String referredDoctorName = (String) variables.get("referredDoctorName");
        String referralType = (String) variables.get("referralType");

        if ("INTERNAL".equals(referralType)) {
            return String.format(
                    "%s has accepted your referral (%s). You can now schedule an appointment with the specialist.",
                    referredDoctorName, referralNumber);
        } else {
            return String.format(
                    "Your external referral (%s) has been processed. Please contact the external facility to schedule your appointment.",
                    referralNumber);
        }
    }

    @Override
    protected Map<String, Object> buildNotificationData(Map<String, Object> variables) {
        Map<String, Object> data = new HashMap<>();
        data.put("type", "referral_accepted");
        data.put("referralId", variables.get("referralId"));
        data.put("referralNumber", variables.get("referralNumber"));
        data.put("referralType", variables.get("referralType"));
        data.put("url", "/patient/referrals");

        return data;
    }

    @Override
    protected void validateRequiredVariables(Map<String, Object> variables) {
        validateRequiredVariable(variables, "referralId", "Referral ID is required");
        validateRequiredVariable(variables, "referralNumber", "Referral number is required");
        validateRequiredVariable(variables, "referralType", "Referral type is required");

        // For internal referrals, referred doctor name is required
        String referralType = (String) variables.get("referralType");
        if ("INTERNAL".equals(referralType)) {
            validateRequiredVariable(variables, "referredDoctorName",
                    "Referred doctor name is required for internal referrals");
        }
    }

    private void validateRequiredVariable(Map<String, Object> variables, String key, String errorMessage) {
        Object value = variables.get(key);
        if (value == null || (value instanceof String && ((String) value).trim().isEmpty())) {
            throw new IllegalArgumentException(errorMessage);
        }
    }
}