package com.mytelmed.infrastructure.email.strategy.delivery;

import com.mailgun.api.v3.MailgunMessagesApi;
import com.mytelmed.infrastructure.email.constant.EmailType;
import com.mytelmed.infrastructure.email.strategy.BaseEmailSenderStrategy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.thymeleaf.spring6.SpringTemplateEngine;
import java.util.Map;


@Slf4j
@Component
public class DeliveryOutEmailSender extends BaseEmailSenderStrategy {
    public DeliveryOutEmailSender(
            MailgunMessagesApi mailgunApi,
            SpringTemplateEngine templateEngine,
            @Value("${mailgun.api.domain}") String mailGunDomain) {
        super(mailgunApi, templateEngine, mailGunDomain);
    }

    @Override
    public EmailType getEmailType() {
        return EmailType.DELIVERY_OUT;
    }

    @Override
    protected String getTemplatePath() {
        return "delivery/out-for-delivery";
    }

    @Override
    protected String buildSubject(Map<String, Object> variables) {
        return "MyTelmed - Medication Out for Delivery";
    }

    @Override
    protected void validateRequiredVariables(Map<String, Object> variables) {
        validateRequiredVariable(variables, "patientName", "Patient name is required");
        validateRequiredVariable(variables, "prescriptionNumber", "Prescription number is required");
        validateRequiredVariable(variables, "trackingReference", "Tracking reference is required");
        validateRequiredVariable(variables, "courierName", "Courier name is required");
        validateRequiredVariable(variables, "deliveryAddress", "Delivery address is required");
        validateRequiredVariable(variables, "estimatedDeliveryDate", "Estimated delivery date is required");
        validateRequiredVariable(variables, "uiHost", "UI host is required");
    }

    private void validateRequiredVariable(Map<String, Object> variables, String key, String errorMessage) {
        Object value = variables.get(key);
        if (value == null || (value instanceof String && ((String) value).trim().isEmpty())) {
            throw new IllegalArgumentException(errorMessage);
        }
    }
}
