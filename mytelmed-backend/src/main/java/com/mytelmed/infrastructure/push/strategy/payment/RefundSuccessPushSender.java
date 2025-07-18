package com.mytelmed.infrastructure.push.strategy.payment;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mytelmed.infrastructure.push.config.VapidConfiguration;
import com.mytelmed.infrastructure.push.constant.NotificationType;
import com.mytelmed.infrastructure.push.strategy.BasePushNotificationStrategy;
import nl.martijndwars.webpush.PushService;
import org.springframework.stereotype.Component;
import java.util.HashMap;
import java.util.Map;

/**
 * Push notification strategy for refund success events in Malaysian public
 * healthcare telemedicine.
 * Sends push notifications to patients when their refunds are successfully
 * processed.
 */
@Component
public class RefundSuccessPushSender extends BasePushNotificationStrategy {

    public RefundSuccessPushSender(
            PushService pushService,
            VapidConfiguration vapidConfiguration,
            ObjectMapper objectMapper) {
        super(pushService, vapidConfiguration, objectMapper);
    }

    @Override
    public NotificationType getNotificationType() {
        return NotificationType.REFUND_SUCCESS;
    }

    @Override
    protected String buildTitle(Map<String, Object> variables) {
        String refundAmount = (String) variables.get("refundAmount");
        return "Refund Processed - RM" + refundAmount;
    }

    @Override
    protected String buildBody(Map<String, Object> variables) {
        String billType = (String) variables.get("billType");
        String refundAmount = (String) variables.get("refundAmount");

        if ("CONSULTATION".equals(billType)) {
            return "Your RM" + refundAmount
                    + " refund for virtual consultation has been processed successfully. Check your email for receipt details.";
        } else {
            return "Your RM" + refundAmount
                    + " refund for medication delivery has been processed successfully. Check your email for receipt details.";
        }
    }

    @Override
    protected String getIconUrl() {
        return "/icons/refund-success.png";
    }

    @Override
    protected String getBadgeUrl() {
        return "/icons/notification-badge.png";
    }

    @Override
    protected Map<String, Object> buildNotificationData(Map<String, Object> variables) {
        Map<String, Object> data = new HashMap<>();
        data.put("type", "refund_success");
        data.put("billNumber", variables.get("billNumber"));
        data.put("refundAmount", variables.get("refundAmount"));
        data.put("stripeRefundId", variables.get("stripeRefundId"));
        data.put("billType", variables.get("billType"));

        // Add URL for deep linking to refund details
        String uiHost = (String) variables.get("uiHost");
        data.put("url", uiHost + "/patient/billing");

        return data;
    }

    @Override
    protected boolean requireInteraction() {
        return false; // User can dismiss the notification
    }

    @Override
    protected boolean isSilent() {
        return false; // Play sound/vibration for refund notifications
    }

    @Override
    protected String getNotificationTag() {
        return "refund_success_" + System.currentTimeMillis();
    }

    @Override
    protected Map<String, Object>[] buildActions(Map<String, Object> variables) {
        String uiHost = (String) variables.get("uiHost");

        Map<String, Object> viewAction = new HashMap<>();
        viewAction.put("action", "view_receipt");
        viewAction.put("title", "View Receipt");
        viewAction.put("url", uiHost + "/patient/billing");

        Map<String, Object> dismissAction = new HashMap<>();
        dismissAction.put("action", "dismiss");
        dismissAction.put("title", "Dismiss");

        return new Map[] { viewAction, dismissAction };
    }

    @Override
    protected void validateRequiredVariables(Map<String, Object> variables) {
        validateRequiredVariable(variables, "patientName", "Patient name is required");
        validateRequiredVariable(variables, "billNumber", "Bill number is required");
        validateRequiredVariable(variables, "billType", "Bill type is required");
        validateRequiredVariable(variables, "refundAmount", "Refund amount is required");
        validateRequiredVariable(variables, "stripeRefundId", "Stripe refund ID is required");
        validateRequiredVariable(variables, "uiHost", "UI host is required");
    }

    private void validateRequiredVariable(Map<String, Object> variables, String key, String errorMessage) {
        if (!variables.containsKey(key) || variables.get(key) == null ||
                (variables.get(key) instanceof String && ((String) variables.get(key)).trim().isEmpty())) {
            throw new IllegalArgumentException(errorMessage);
        }
    }
}