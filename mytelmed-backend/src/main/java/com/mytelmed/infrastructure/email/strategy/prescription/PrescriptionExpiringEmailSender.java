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
public class PrescriptionExpiringEmailSender extends BaseEmailSenderStrategy {
    public PrescriptionExpiringEmailSender(
            MailgunMessagesApi mailgunApi,
            SpringTemplateEngine templateEngine,
            @Value("${mailgun.api.domain}") String mailGunDomain) {
        super(mailgunApi, templateEngine, mailGunDomain);
    }

    @Override
    public EmailType getEmailType() {
        return EmailType.PRESCRIPTION_EXPIRING;
    }

    @Override
    protected String getTemplatePath() {
        return "prescription/expiring";
    }

    @Override
    protected String buildSubject(Map<String, Object> variables) {
        return "MyTelmed - Your Prescription is Expiring Soon";
    }

    @Override
    protected void validateRequiredVariables(Map<String, Object> variables) {
        validateRequiredVariable(variables, "prescriptionId", "Prescription ID is required");
        validateRequiredVariable(variables, "patientName", "Patient name is required");
        validateRequiredVariable(variables, "expiryDate", "Expiry date is required");
        validateRequiredVariable(variables, "daysUntilExpiry", "Days until expiry is required");
        validateRequiredVariable(variables, "uiHost", "UI host is required");
    }

    private void validateRequiredVariable(Map<String, Object> variables, String key, String errorMessage) {
        Object value = variables.get(key);
        if (value == null || (value instanceof String && ((String) value).trim().isEmpty())) {
            throw new IllegalArgumentException(errorMessage);
        }
    }
}
