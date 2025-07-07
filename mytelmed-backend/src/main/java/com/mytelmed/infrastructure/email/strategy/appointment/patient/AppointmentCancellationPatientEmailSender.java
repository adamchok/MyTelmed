package com.mytelmed.infrastructure.email.strategy.appointment.patient;

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
public class AppointmentCancellationPatientEmailSender extends BaseEmailSenderStrategy {
    public AppointmentCancellationPatientEmailSender(
            MailgunMessagesApi mailgunApi,
            SpringTemplateEngine templateEngine,
            @Value("${mailgun.api.domain}") String mailGunDomain) {
        super(mailgunApi, templateEngine, mailGunDomain);
    }

    @Override
    public EmailType getEmailType() {
        return EmailType.APPOINTMENT_CANCEL_PATIENT;
    }

    @Override
    protected String getTemplatePath() {
        return "appointment/patient/cancel";
    }

    @Override
    protected String buildSubject(Map<String, Object> variables) {
        return "MyTelmed - Appointment Cancelled";
    }

    @Override
    protected void validateRequiredVariables(Map<String, Object> variables) {
        validateRequiredVariable(variables, "appointmentId", "Appointment ID is required");
        validateRequiredVariable(variables, "inviterName", "Patient name is required");
        validateRequiredVariable(variables, "providerName", "Provider name is required");
        validateRequiredVariable(variables, "appointmentDateTime", "Appointment date and time is required");
        validateRequiredVariable(variables, "uiHost", "UI host is required");

        // reasonForVisit and cancellationReason are optional - no validation needed
    }

    private void validateRequiredVariable(Map<String, Object> variables, String key, String errorMessage) {
        Object value = variables.get(key);
        if (value == null || (value instanceof String && ((String) value).trim().isEmpty())) {
            throw new IllegalArgumentException(errorMessage);
        }
    }
}
