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
 * Push notification strategy for referral rejection events in Malaysian public
 * healthcare telemedicine.
 * Sends push notifications to patients and authorized family members when a
 * referral is rejected by the referred doctor.
 */
@Component
public class ReferralRejectedPushSender extends BasePushNotificationStrategy {

    public ReferralRejectedPushSender(
            PushService pushService,
            VapidConfiguration vapidConfiguration,
            ObjectMapper objectMapper) {
        super(pushService, vapidConfiguration, objectMapper);
    }

    @Override
    public PushNotificationType getNotificationType() {
        return PushNotificationType.REFERRAL_REJECTED;
    }

    @Override
    protected String buildTitle(Map<String, Object> variables) {
        return "❌ Referral Update Required";
    }

    @Override
    protected String buildBody(Map<String, Object> variables) {
        String referralNumber = (String) variables.get("referralNumber");
        String referredDoctorName = (String) variables.get("referredDoctorName");
        String rejectionReason = (String) variables.get("rejectionReason");

        StringBuilder body = new StringBuilder();

        if (referredDoctorName != null) {
            body.append(String.format("%s is unable to accept your referral (%s).",
                    referredDoctorName, referralNumber));
        } else {
            body.append(String.format("Your referral (%s) requires attention.", referralNumber));
        }

        if (rejectionReason != null && !rejectionReason.trim().isEmpty()) {
            body.append(String.format(" Reason: %s.", rejectionReason));
        }

        body.append(" Please contact your referring doctor for alternative options.");

        return body.toString();
    }

    @Override
    protected Map<String, Object> buildNotificationData(Map<String, Object> variables) {
        Map<String, Object> data = new HashMap<>();
        data.put("type", "referral_rejected");
        data.put("referralId", variables.get("referralId"));
        data.put("referralNumber", variables.get("referralNumber"));
        data.put("referralType", variables.get("referralType"));

        if (variables.get("rejectionReason") != null) {
            data.put("rejectionReason", variables.get("rejectionReason"));
        }

        // Navigation to referral details
        data.put("url", "/patient/referrals");

        return data;
    }

    @Override
    protected void validateRequiredVariables(Map<String, Object> variables) {
        validateRequiredVariable(variables, "referralId", "Referral ID is required");
        validateRequiredVariable(variables, "referralNumber", "Referral number is required");
        validateRequiredVariable(variables, "referralType", "Referral type is required");

        // Rejection reason is optional but helpful
    }

    private void validateRequiredVariable(Map<String, Object> variables, String key, String errorMessage) {
        Object value = variables.get(key);
        if (value == null || (value instanceof String && ((String) value).trim().isEmpty())) {
            throw new IllegalArgumentException(errorMessage);
        }
    }
}