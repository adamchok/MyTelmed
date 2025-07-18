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
 * Email sender strategy for refund success notifications in Malaysian public
 * healthcare telemedicine.
 * Sends professional refund confirmation emails to patients with Stripe receipt
 * details
 * when refunds are successfully processed.
 */
@Slf4j
@Component
public class RefundSuccessEmailSender extends BaseEmailSenderStrategy {

    public RefundSuccessEmailSender(
            MailgunMessagesApi mailgunApi,
            SpringTemplateEngine templateEngine,
            @Value("${mailgun.api.domain}") String mailGunDomain) {
        super(mailgunApi, templateEngine, mailGunDomain);
    }

    @Override
    public EmailType getEmailType() {
        return EmailType.REFUND_SUCCESS;
    }

    @Override
    protected String getTemplatePath() {
        return "billing/refund-success";
    }

    @Override
    protected String buildSubject(Map<String, Object> variables) {
        String refundAmount = (String) variables.get("refundAmount");
        String billType = (String) variables.get("billType");

        if ("CONSULTATION".equals(billType)) {
            return "MyTelmed - Refund Processed: RM" + refundAmount + " for Virtual Consultation";
        } else {
            return "MyTelmed - Refund Processed: RM" + refundAmount + " for Medication Delivery";
        }
    }

    @Override
    protected void validateRequiredVariables(Map<String, Object> variables) {
        // Patient information
        validateRequiredVariable(variables, "patientName", "Patient name is required");

        // Bill and transaction details
        validateRequiredVariable(variables, "billNumber", "Bill number is required");
        validateRequiredVariable(variables, "billType", "Bill type is required");
        validateRequiredVariable(variables, "transactionNumber", "Transaction number is required");

        // Refund details
        validateRequiredVariable(variables, "refundAmount", "Refund amount is required");
        validateRequiredVariable(variables, "stripeRefundId", "Stripe refund ID is required");
        validateRequiredVariable(variables, "refundReason", "Refund reason is required");
        validateRequiredVariable(variables, "refundProcessedAt", "Refund processed date is required");

        // Original payment details for receipt
        validateRequiredVariable(variables, "originalAmount", "Original amount is required");
        validateRequiredVariable(variables, "originalPaymentDate", "Original payment date is required");
        validateRequiredVariable(variables, "originalChargeId", "Original charge ID is required");

        // System details
        validateRequiredVariable(variables, "uiHost", "UI host is required");

        log.debug("All required variables validated for refund success email");
    }

    private void validateRequiredVariable(Map<String, Object> variables, String key, String errorMessage) {
        if (!variables.containsKey(key) || variables.get(key) == null ||
                (variables.get(key) instanceof String && ((String) variables.get(key)).trim().isEmpty())) {
            throw new IllegalArgumentException(errorMessage);
        }
    }
}
