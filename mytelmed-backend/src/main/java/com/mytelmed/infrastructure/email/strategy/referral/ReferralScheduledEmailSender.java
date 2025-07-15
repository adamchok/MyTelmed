package com.mytelmed.infrastructure.email.strategy.referral;

import com.mailgun.api.v3.MailgunMessagesApi;
import com.mytelmed.infrastructure.email.constant.EmailType;
import com.mytelmed.infrastructure.email.strategy.BaseEmailSenderStrategy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.thymeleaf.spring6.SpringTemplateEngine;
import java.util.Map;

/**
 * Email sender strategy for referral scheduling notifications in Malaysian
 * public
 * healthcare telemedicine.
 * Sends professional appointment scheduled emails to patients and authorized
 * family members when a referral appointment is scheduled.
 */
@Slf4j
@Component
public class ReferralScheduledEmailSender extends BaseEmailSenderStrategy {

    public ReferralScheduledEmailSender(
            MailgunMessagesApi mailgunApi,
            SpringTemplateEngine templateEngine,
            @Value("${mailgun.api.domain}") String mailGunDomain) {
        super(mailgunApi, templateEngine, mailGunDomain);
    }

    @Override
    public EmailType getEmailType() {
        return EmailType.REFERRAL_SCHEDULED;
    }

    @Override
    protected String getTemplatePath() {
        return "referral/scheduled";
    }

    @Override
    protected String buildSubject(Map<String, Object> variables) {
        String referralNumber = (String) variables.get("referralNumber");
        String consultationMode = (String) variables.get("consultationMode");
        String referredDoctorName = (String) variables.get("referredDoctorName");

        if ("VIRTUAL".equals(consultationMode)) {
            return String.format("MyTelmed - Virtual Appointment Scheduled with %s (%s)",
                    referredDoctorName, referralNumber);
        } else {
            return String.format("MyTelmed - Appointment Scheduled with %s (%s)",
                    referredDoctorName, referralNumber);
        }
    }

    @Override
    protected void validateRequiredVariables(Map<String, Object> variables) {
        validateRequiredVariable(variables, "referralId", "Referral ID is required");
        validateRequiredVariable(variables, "referralNumber", "Referral number is required");
        validateRequiredVariable(variables, "appointmentId", "Appointment ID is required");
        validateRequiredVariable(variables, "appointmentDateTime", "Appointment date and time is required");
        validateRequiredVariable(variables, "consultationMode", "Consultation mode is required");
        validateRequiredVariable(variables, "patientName", "Patient name is required");
        validateRequiredVariable(variables, "referredDoctorName", "Referred doctor name is required");
        validateRequiredVariable(variables, "facilityName", "Facility name is required");
        validateRequiredVariable(variables, "reasonForReferral", "Reason for referral is required");
        validateRequiredVariable(variables, "uiHost", "UI host is required");

        // Optional but commonly used variables
        log.debug("Optional variables - referredDoctorSpeciality: {}, facilityAddress: {}",
                variables.get("referredDoctorSpeciality"), variables.get("facilityAddress"));

        log.debug("Validation passed for referral scheduled email for referral: {}", variables.get("referralNumber"));
    }

    private void validateRequiredVariable(Map<String, Object> variables, String key, String errorMessage) {
        Object value = variables.get(key);
        if (value == null || (value instanceof String && ((String) value).trim().isEmpty())) {
            throw new IllegalArgumentException(errorMessage);
        }
    }
}