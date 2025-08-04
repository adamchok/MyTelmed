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
public class DeliveryPaymentConfirmedStartedEmailSender extends BaseEmailSenderStrategy {
    public DeliveryPaymentConfirmedStartedEmailSender(
            MailgunMessagesApi mailgunApi,
            SpringTemplateEngine templateEngine,
            @Value("${mailgun.api.domain}") String mailGunDomain) {
        super(mailgunApi, templateEngine, mailGunDomain);
    }

    @Override
    public EmailType getEmailType() {
        return EmailType.DELIVERY_PAYMENT_CONFIRMED;
    }

    @Override
    protected String getTemplatePath() {
        return "delivery/payment-confirmed";
    }

    @Override
    protected String buildSubject(Map<String, Object> variables) {
        return "MyTelmed - Medication Delivery Payment Confirmed";
    }

    @Override
    protected void validateRequiredVariables(Map<String, Object> variables) {
        validateRequiredVariable(variables, "patientName", "Patient name is required");
        validateRequiredVariable(variables, "prescriptionNumber", "Prescription number is required");
        validateRequiredVariable(variables, "deliveryMethod", "Delivery method is required");
        validateRequiredVariable(variables, "facilityName", "Facility name is required");
    }

    private void validateRequiredVariable(Map<String, Object> variables, String key, String errorMessage) {
        Object value = variables.get(key);
        if (value == null || (value instanceof String && ((String) value).trim().isEmpty())) {
            throw new IllegalArgumentException(errorMessage);
        }
    }
}
