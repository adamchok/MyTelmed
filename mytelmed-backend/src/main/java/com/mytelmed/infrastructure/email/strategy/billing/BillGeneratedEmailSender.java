package com.mytelmed.infrastructure.email.strategy.billing;

import com.mailgun.api.v3.MailgunMessagesApi;
import com.mytelmed.infrastructure.email.constant.EmailType;
import com.mytelmed.infrastructure.email.strategy.BaseEmailSenderStrategy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.thymeleaf.spring6.SpringTemplateEngine;
import java.util.Map;

/**
 * Email sender strategy for billing invoice notifications in Malaysian public
 * healthcare telemedicine.
 * Sends professional invoice emails to patients when bills are generated.
 */
@Slf4j
@Component
public class BillGeneratedEmailSender extends BaseEmailSenderStrategy {

  public BillGeneratedEmailSender(
      MailgunMessagesApi mailgunApi,
      SpringTemplateEngine templateEngine,
      @Value("${mailgun.api.domain}") String mailGunDomain) {
    super(mailgunApi, templateEngine, mailGunDomain);
  }

  @Override
  public EmailType getEmailType() {
    return EmailType.BILL_GENERATED;
  }

  @Override
  protected String getTemplatePath() {
    return "billing/invoice";
  }

  @Override
  protected String buildSubject(Map<String, Object> variables) {
    String billNumber = (String) variables.get("billNumber");
    String billType = (String) variables.get("billType");

    if ("CONSULTATION".equals(billType)) {
      return "MyTelmed - Invoice for Virtual Consultation (" + billNumber + ")";
    } else {
      return "MyTelmed - Invoice for Medication Delivery (" + billNumber + ")";
    }
  }

  @Override
  protected void validateRequiredVariables(Map<String, Object> variables) {
    validateRequiredVariable(variables, "billId", "Bill ID is required");
    validateRequiredVariable(variables, "billNumber", "Bill number is required");
    validateRequiredVariable(variables, "billType", "Bill type is required");
    validateRequiredVariable(variables, "amount", "Amount is required");
    validateRequiredVariable(variables, "patientName", "Patient name is required");
    validateRequiredVariable(variables, "patientEmail", "Patient email is required");
    validateRequiredVariable(variables, "billedAt", "Billed date is required");
    validateRequiredVariable(variables, "description", "Description is required");
    validateRequiredVariable(variables, "paymentUrl", "Payment URL is required");
    validateRequiredVariable(variables, "uiHost", "UI host is required");

    log.debug("Validation passed for bill generated email for bill: {}", variables.get("billNumber"));
  }

  private void validateRequiredVariable(Map<String, Object> variables, String key, String errorMessage) {
    Object value = variables.get(key);
    if (value == null || (value instanceof String && ((String) value).trim().isEmpty())) {
      throw new IllegalArgumentException(errorMessage);
    }
  }
}