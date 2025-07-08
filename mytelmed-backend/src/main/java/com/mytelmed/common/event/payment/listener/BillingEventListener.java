package com.mytelmed.common.event.payment.listener;

import com.mytelmed.common.event.payment.model.BillGeneratedEvent;
import com.mytelmed.common.event.payment.model.PaymentCompletedEvent;
import com.mytelmed.infrastructure.email.constant.EmailType;
import com.mytelmed.infrastructure.email.factory.EmailSenderFactoryRegistry;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import java.util.HashMap;
import java.util.Map;


/**
 * Event listener for billing-related events in Malaysian public healthcare
 * telemedicine.
 * Handles sending of invoice and receipt emails to patients.
 */
@Slf4j
@Component
public class BillingEventListener {

    private final EmailSenderFactoryRegistry emailService;
    private final String frontendUrl;

    public BillingEventListener(EmailSenderFactoryRegistry emailService,
                                @Value("${application.frontend.url}") String frontendUrl) {
        this.emailService = emailService;
        this.frontendUrl = frontendUrl;
    }

    /**
     * Handles bill generation events and sends invoice emails to patients
     */
    @Async
    @EventListener
    public void handleBillGenerated(BillGeneratedEvent event) {
        log.info("Handling bill generated event for bill: {}", event.bill().getBillNumber());

        try {
            Map<String, Object> emailVariables = buildBillGeneratedEmailVariables(event);

            // Send invoice email to patient
            sendEmailNotification(event.bill().getPatient().getEmail(),
                    EmailType.BILL_GENERATED, emailVariables);

            log.info("Successfully sent bill generated notification for bill: {}",
                    event.bill().getBillNumber());
        } catch (Exception e) {
            log.error("Error sending bill generated notification for bill: {}",
                    event.bill().getBillNumber(), e);
        }
    }

    /**
     * Handles payment completion events and sends receipt emails to patients
     */
    @Async
    @EventListener
    public void handlePaymentCompleted(PaymentCompletedEvent event) {
        log.info("Handling payment completed event for bill: {} transaction: {}",
                event.bill().getBillNumber(), event.transaction().getTransactionNumber());

        try {
            Map<String, Object> emailVariables = buildPaymentCompletedEmailVariables(event);

            // Send receipt email to patient
            sendEmailNotification(event.bill().getPatient().getEmail(),
                    EmailType.PAYMENT_RECEIPT, emailVariables);

            log.info("Successfully sent payment receipt notification for transaction: {}",
                    event.transaction().getTransactionNumber());
        } catch (Exception e) {
            log.error("Error sending payment receipt notification for transaction: {}",
                    event.transaction().getTransactionNumber(), e);
        }
    }

    /**
     * Builds email variables for bill generated notifications (invoice)
     */
    private Map<String, Object> buildBillGeneratedEmailVariables(BillGeneratedEvent event) {
        Map<String, Object> variables = new HashMap<>();

        // Bill information
        variables.put("billId", event.bill().getId().toString());
        variables.put("billNumber", event.bill().getBillNumber());
        variables.put("billType", event.bill().getBillType().toString());
        variables.put("amount", event.bill().getAmount());
        variables.put("description", event.bill().getDescription());
        variables.put("billedAt", event.bill().getBilledAt());

        // Patient information
        variables.put("patientName", event.bill().getPatient().getName());
        variables.put("patientEmail", event.bill().getPatient().getEmail());

        // Service-specific information
        if (event.bill().getAppointment() != null) {
            variables.put("doctorName", "Dr. " + event.bill().getAppointment().getDoctor().getName());
            variables.put("appointmentDate", event.bill().getAppointment().getTimeSlot().getStartTime());
        }

        if (event.bill().getPrescription() != null) {
            variables.put("doctorName", "Dr. " + event.bill().getPrescription().getDoctor().getName());
        }

        // Payment and UI links
        variables.put("paymentUrl", buildPaymentUrl(event.bill()));
        variables.put("uiHost", frontendUrl);

        return variables;
    }

    /**
     * Builds email variables for payment completed notifications (receipt)
     */
    private Map<String, Object> buildPaymentCompletedEmailVariables(PaymentCompletedEvent event) {
        Map<String, Object> variables = new HashMap<>();

        // Bill information
        variables.put("billId", event.bill().getId().toString());
        variables.put("billNumber", event.bill().getBillNumber());
        variables.put("billType", event.bill().getBillType().toString());
        variables.put("amount", event.bill().getAmount());
        variables.put("description", event.bill().getDescription());
        variables.put("paidAt", event.bill().getPaidAt());

        // Patient information
        variables.put("patientName", event.bill().getPatient().getName());
        variables.put("patientEmail", event.bill().getPatient().getEmail());

        // Transaction information
        variables.put("transactionId", event.transaction().getId().toString());
        variables.put("transactionNumber", event.transaction().getTransactionNumber());
        variables.put("paymentMethod", getReadablePaymentMethod(event.transaction().getPaymentMode()));
        variables.put("currency", event.transaction().getCurrency());
        variables.put("stripeChargeId", event.transaction().getStripeChargeId());

        // Service-specific information
        if (event.bill().getAppointment() != null) {
            variables.put("doctorName", "Dr. " + event.bill().getAppointment().getDoctor().getName());
            variables.put("appointmentDate", event.bill().getAppointment().getTimeSlot().getStartTime());
        }

        if (event.bill().getPrescription() != null) {
            variables.put("doctorName", "Dr. " + event.bill().getPrescription().getDoctor().getName());
        }

        // UI links
        variables.put("uiHost", frontendUrl);

        return variables;
    }

    /**
     * Builds the payment URL for bill payments
     */
    private String buildPaymentUrl(com.mytelmed.core.payment.entity.Bill bill) {
        if (bill.getAppointment() != null) {
            return frontendUrl + "/patient/appointment/" + bill.getAppointment().getId() + "/payment";
        } else if (bill.getPrescription() != null) {
            return frontendUrl + "/patient/prescription/" + bill.getPrescription().getId() + "/payment";
        } else {
            return frontendUrl + "/patient/billing/" + bill.getId() + "/payment";
        }
    }

    /**
     * Converts payment mode enum to readable format
     */
    private String getReadablePaymentMethod(com.mytelmed.common.constant.payment.PaymentMode paymentMode) {
        return switch (paymentMode) {
            case CARD -> "Credit/Debit Card";
            case ONLINE_BANKING -> "Online Banking";
            case WALLET -> "Digital Wallet";
            case CASH -> "Cash";
        };
    }

    /**
     * Sends email notification using the email service
     */
    private void sendEmailNotification(String recipientEmail, EmailType emailType, Map<String, Object> variables) {
        try {
            emailService.getEmailSender(emailType).sendEmail(recipientEmail, variables);
        } catch (Exception e) {
            log.error("Failed to send {} email notification to: {}", emailType, recipientEmail, e);
            throw e;
        }
    }
}
