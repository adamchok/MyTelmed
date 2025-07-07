package com.mytelmed.infrastructure.email.strategy.prescription;

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
public class PrescriptionOutForDeliveryEmailSender extends BaseEmailSenderStrategy {
    public PrescriptionOutForDeliveryEmailSender(
            MailgunMessagesApi mailgunApi,
            SpringTemplateEngine templateEngine,
            @Value("${mailgun.api.domain}") String mailGunDomain) {
        super(mailgunApi, templateEngine, mailGunDomain);
    }

    @Override
    public EmailType getEmailType() {
        return EmailType.PRESCRIPTION_OUT_FOR_DELIVERY;
    }

    @Override
    protected String getTemplatePath() {
        return "prescription/out-for-delivery";
    }

    @Override
    protected String buildSubject(Map<String, Object> variables) {
        return "MyTelmed - Your Prescription is Out for Delivery";
    }

    @Override
    protected void validateRequiredVariables(Map<String, Object> variables) {
        validateRequiredVariable(variables, "prescriptionId", "Prescription ID is required");
        validateRequiredVariable(variables, "patientName", "Patient name is required");
        validateRequiredVariable(variables, "deliveryAddress", "Delivery address is required");
        validateRequiredVariable(variables, "uiHost", "UI host is required");
    }

    private void validateRequiredVariable(Map<String, Object> variables, String key, String errorMessage) {
        Object value = variables.get(key);
        if (value == null || (value instanceof String && ((String) value).trim().isEmpty())) {
            throw new IllegalArgumentException(errorMessage);
        }
    }
}
