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
 * Email sender strategy for referral notifications in Malaysian public
 * healthcare telemedicine.
 * Sends professional referral notification emails to patients and authorized
 * family members.
 */
@Slf4j
@Component
public class ReferralCreatedEmailSender extends BaseEmailSenderStrategy {

  public ReferralCreatedEmailSender(
      MailgunMessagesApi mailgunApi,
      SpringTemplateEngine templateEngine,
      @Value("${mailgun.api.domain}") String mailGunDomain) {
    super(mailgunApi, templateEngine, mailGunDomain);
  }

  @Override
  public EmailType getEmailType() {
    return EmailType.REFERRAL_CREATED;
  }

  @Override
  protected String getTemplatePath() {
    return "referral/created";
  }

  @Override
  protected String buildSubject(Map<String, Object> variables) {
    String referralNumber = (String) variables.get("referralNumber");
    String priority = (String) variables.get("priority");
    String referralType = (String) variables.get("referralType");

    String priorityPrefix = "";
    if ("URGENT".equals(priority)) {
      priorityPrefix = "[URGENT] ";
    } else if ("EMERGENCY".equals(priority)) {
      priorityPrefix = "[EMERGENCY] ";
    }

    String typeDescription = "INTERNAL".equals(referralType) ? "Specialist Referral" : "External Referral";

    return priorityPrefix + "MyTelmed - New " + typeDescription + " (" + referralNumber + ")";
  }

  @Override
  protected void validateRequiredVariables(Map<String, Object> variables) {
    validateRequiredVariable(variables, "referralId", "Referral ID is required");
    validateRequiredVariable(variables, "referralNumber", "Referral number is required");
    validateRequiredVariable(variables, "referralType", "Referral type is required");
    validateRequiredVariable(variables, "priority", "Priority is required");
    validateRequiredVariable(variables, "patientName", "Patient name is required");
    validateRequiredVariable(variables, "referringDoctorName", "Referring doctor name is required");
    validateRequiredVariable(variables, "reasonForReferral", "Reason for referral is required");
    validateRequiredVariable(variables, "clinicalSummary", "Clinical summary is required");
    validateRequiredVariable(variables, "uiHost", "UI host is required");

    if (variables.get("createdAt") == null) {
      throw new IllegalArgumentException("Created date is required");
    }

    if (variables.get("expiryDate") == null) {
      throw new IllegalArgumentException("Expiry date is required");
    }

    // Validate type-specific requirements
    String referralType = (String) variables.get("referralType");
    if ("INTERNAL".equals(referralType)) {
      validateRequiredVariable(variables, "referredDoctorName",
          "Referred doctor name is required for internal referrals");
    } else if ("EXTERNAL".equals(referralType)) {
      validateRequiredVariable(variables, "externalDoctorName",
          "External doctor name is required for external referrals");
    }

    log.debug("Validation passed for referral created email for referral: {}", variables.get("referralNumber"));
  }

  private void validateRequiredVariable(Map<String, Object> variables, String key, String errorMessage) {
    Object value = variables.get(key);
    if (value == null || (value instanceof String && ((String) value).trim().isEmpty())) {
      throw new IllegalArgumentException(errorMessage);
    }
  }
}