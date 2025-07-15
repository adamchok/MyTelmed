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
 * Email sender strategy for referral rejection notifications in Malaysian
 * public
 * healthcare telemedicine.
 * Sends professional rejection emails to patients and authorized family members
 * when a referral is rejected by the specialist.
 */
@Slf4j
@Component
public class ReferralRejectedEmailSender extends BaseEmailSenderStrategy {

    public ReferralRejectedEmailSender(
            MailgunMessagesApi mailgunApi,
            SpringTemplateEngine templateEngine,
            @Value("${mailgun.api.domain}") String mailGunDomain) {
        super(mailgunApi, templateEngine, mailGunDomain);
    }

    @Override
    public EmailType getEmailType() {
        return EmailType.REFERRAL_REJECTED;
    }

    @Override
    protected String getTemplatePath() {
        return "referral/rejected";
    }

    @Override
    protected String buildSubject(Map<String, Object> variables) {
        String referralNumber = (String) variables.get("referralNumber");
        String referredDoctorName = (String) variables.get("referredDoctorName");
        String referralType = (String) variables.get("referralType");

        if ("INTERNAL".equals(referralType) && referredDoctorName != null) {
            return String.format("MyTelmed - Referral Update Required: %s (%s)",
                    referredDoctorName, referralNumber);
        } else {
            return String.format("MyTelmed - Referral Update Required (%s)", referralNumber);
        }
    }

    @Override
    protected void validateRequiredVariables(Map<String, Object> variables) {
        validateRequiredVariable(variables, "referralId", "Referral ID is required");
        validateRequiredVariable(variables, "referralNumber", "Referral number is required");
        validateRequiredVariable(variables, "referralType", "Referral type is required");
        validateRequiredVariable(variables, "patientName", "Patient name is required");
        validateRequiredVariable(variables, "referringDoctorName", "Referring doctor name is required");
        validateRequiredVariable(variables, "reasonForReferral", "Reason for referral is required");
        validateRequiredVariable(variables, "rejectedAt", "Rejected date is required");
        validateRequiredVariable(variables, "uiHost", "UI host is required");

        // Rejection reason is optional but helpful if provided
        log.debug("Validation passed for referral rejected email for referral: {}", variables.get("referralNumber"));
    }

    private void validateRequiredVariable(Map<String, Object> variables, String key, String errorMessage) {
        Object value = variables.get(key);
        if (value == null || (value instanceof String && ((String) value).trim().isEmpty())) {
            throw new IllegalArgumentException(errorMessage);
        }
    }
}