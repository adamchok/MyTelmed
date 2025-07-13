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
public class AppointmentBookedPatientEmailSender extends BaseEmailSenderStrategy {
    public AppointmentBookedPatientEmailSender(
            MailgunMessagesApi mailgunApi,
            SpringTemplateEngine templateEngine,
            @Value("${mailgun.api.domain}") String mailGunDomain) {
        super(mailgunApi, templateEngine, mailGunDomain);
    }

    @Override
    public EmailType getEmailType() {
        return EmailType.APPOINTMENT_BOOKED_PATIENT;
    }

    @Override
    protected String getTemplatePath() {
        return "appointment/patient/booked";
    }

    @Override
    protected String buildSubject(Map<String, Object> variables) {
        return "MyTelmed - New Appointment Booked";
    }

    @Override
    protected void validateRequiredVariables(Map<String, Object> variables) {
        validateRequiredVariable(variables, "appointmentId", "Appointment ID is required");
        validateRequiredVariable(variables, "patientName", "Patient name is required");
        validateRequiredVariable(variables, "providerName", "Provider name is required");
        validateRequiredVariable(variables, "appointmentDateTime", "Appointment date and time is required");
        validateRequiredVariable(variables, "consultationMode", "Consultation mode is required");
        validateRequiredVariable(variables, "uiHost", "UI host is required");

        // reasonForVisit and patientNotes are optional - no validation needed
    }

    private void validateRequiredVariable(Map<String, Object> variables, String key, String errorMessage) {
        Object value = variables.get(key);
        if (value == null || (value instanceof String && ((String) value).trim().isEmpty())) {
            throw new IllegalArgumentException(errorMessage);
        }
    }
}
