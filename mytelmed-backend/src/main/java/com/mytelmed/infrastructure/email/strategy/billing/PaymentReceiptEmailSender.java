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
 * Email sender strategy for payment receipt notifications in Malaysian public
 * healthcare telemedicine.
 * Sends professional payment receipt emails to patients when payments are
 * completed.
 */
@Slf4j
@Component
public class PaymentReceiptEmailSender extends BaseEmailSenderStrategy {

  public PaymentReceiptEmailSender(
      MailgunMessagesApi mailgunApi,
      SpringTemplateEngine templateEngine,
      @Value("${mailgun.api.domain}") String mailGunDomain) {
    super(mailgunApi, templateEngine, mailGunDomain);
  }

  @Override
  public EmailType getEmailType() {
    return EmailType.PAYMENT_RECEIPT;
  }

  @Override
  protected String getTemplatePath() {
    return "billing/receipt";
  }

  @Override
  protected String buildSubject(Map<String, Object> variables) {
    String transactionNumber = (String) variables.get("transactionNumber");
    String billType = (String) variables.get("billType");

    if ("CONSULTATION".equals(billType)) {
      return "MyTelmed - Payment Receipt for Virtual Consultation (" + transactionNumber + ")";
    } else {
      return "MyTelmed - Payment Receipt for Medication Delivery (" + transactionNumber + ")";
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
    validateRequiredVariable(variables, "transactionId", "Transaction ID is required");
    validateRequiredVariable(variables, "transactionNumber", "Transaction number is required");
    validateRequiredVariable(variables, "paymentMethod", "Payment method is required");
    validateRequiredVariable(variables, "currency", "Currency is required");
    validateRequiredVariable(variables, "paidAt", "Payment date is required");
    validateRequiredVariable(variables, "description", "Description is required");
    validateRequiredVariable(variables, "uiHost", "UI host is required");

    log.debug("Validation passed for payment receipt email for transaction: {}", variables.get("transactionNumber"));
  }

  private void validateRequiredVariable(Map<String, Object> variables, String key, String errorMessage) {
    Object value = variables.get(key);
    if (value == null || (value instanceof String && ((String) value).trim().isEmpty())) {
      throw new IllegalArgumentException(errorMessage);
    }
  }
}