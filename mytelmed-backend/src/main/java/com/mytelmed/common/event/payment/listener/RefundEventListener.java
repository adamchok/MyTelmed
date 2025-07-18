package com.mytelmed.common.event.payment.listener;

import com.mytelmed.common.event.payment.model.RefundCompletedEvent;
import com.mytelmed.core.family.entity.FamilyMember;
import com.mytelmed.core.family.repository.FamilyMemberRepository;
import com.mytelmed.core.notification.service.PushSubscriptionService;
import com.mytelmed.core.patient.entity.Patient;
import com.mytelmed.core.patient.service.PatientService;
import com.mytelmed.infrastructure.email.constant.EmailType;
import com.mytelmed.infrastructure.email.factory.EmailSenderFactoryRegistry;
import com.mytelmed.infrastructure.push.constant.NotificationType;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Event listener for refund-related events in Malaysian public healthcare
 * telemedicine.
 * Handles sending of refund notification emails and push notifications to
 * patients
 * and their authorized family members.
 */
@Slf4j
@Component
public class RefundEventListener {
    private final EmailSenderFactoryRegistry emailFactoryRegistry;
    private final PushSubscriptionService pushSubscriptionService;
    private final FamilyMemberRepository familyMemberRepository;
    private final PatientService patientService;
    private final String frontendUrl;

    public RefundEventListener(
            EmailSenderFactoryRegistry emailFactoryRegistry,
            PushSubscriptionService pushSubscriptionService,
            FamilyMemberRepository familyMemberRepository,
            PatientService patientService,
            @Value("${application.frontend.url}") String frontendUrl) {
        this.emailFactoryRegistry = emailFactoryRegistry;
        this.pushSubscriptionService = pushSubscriptionService;
        this.familyMemberRepository = familyMemberRepository;
        this.patientService = patientService;
        this.frontendUrl = frontendUrl;
    }

    /**
     * Handles refund completed events and sends notifications to patients and
     * authorized family members
     */
    @Async
    @EventListener
    public void handleRefundCompleted(RefundCompletedEvent event) {
        log.info("Handling refund completed event for bill: {} with Stripe refund ID: {}",
                event.bill().getBillNumber(), event.stripeRefundId());

        try {
            // Build specific variables for each strategy
            Map<String, Object> emailVariables = buildRefundCompletedEmailVariables(event);
            Map<String, Object> pushVariables = buildRefundCompletedPushVariables(event);

            // Send email to patient
            String patientEmail = event.bill().getPatient().getEmail();
            sendEmailNotification(patientEmail, EmailType.REFUND_SUCCESS, emailVariables);
            log.debug("Sent refund success email notification to patient: {}", patientEmail);

            // Send push notification to patient
            UUID patientAccountId = event.bill().getPatient().getAccount().getId();
            sendPushNotification(patientAccountId, NotificationType.REFUND_SUCCESS, pushVariables);
            log.debug("Sent refund success push notification to patient account: {}", patientAccountId);

            // Send notifications to authorized family members with MANAGE_APPOINTMENTS
            // permission
            sendNotificationsToAuthorizedFamilyMembers(event.bill().getPatient().getId(),
                    emailVariables, pushVariables, EmailType.REFUND_SUCCESS, NotificationType.REFUND_SUCCESS);

            log.info("Successfully sent refund completed notifications for bill: {}",
                    event.bill().getBillNumber());
        } catch (Exception e) {
            log.error("Error sending refund completed notifications for bill: {}",
                    event.bill().getBillNumber(), e);
        }
    }

    /**
     * Builds email variables for refund completed notifications
     */
    private Map<String, Object> buildRefundCompletedEmailVariables(RefundCompletedEvent event) {
        Map<String, Object> variables = new HashMap<>();

        // Patient information
        variables.put("patientName", event.bill().getPatient().getName());

        // Bill and transaction details
        variables.put("billNumber", event.bill().getBillNumber());
        variables.put("billType", event.bill().getBillType().toString());
        variables.put("transactionNumber", event.transaction().getTransactionNumber());

        // Refund details
        variables.put("refundAmount", event.refundAmount().toString());
        variables.put("stripeRefundId", event.stripeRefundId());
        variables.put("refundReason", event.refundReason() != null ? event.refundReason() : "Refund processed");
        variables.put("refundProcessedAt", event.transaction().getRefundedAt());

        // Original payment details for receipt
        variables.put("originalAmount", event.transaction().getAmount().toString());
        variables.put("originalPaymentDate", event.transaction().getCreatedAt());
        variables.put("originalChargeId", event.transaction().getStripeChargeId());

        // System details
        variables.put("uiHost", frontendUrl);

        return variables;
    }

    /**
     * Builds push notification variables for refund completed notifications
     */
    private Map<String, Object> buildRefundCompletedPushVariables(RefundCompletedEvent event) {
        Map<String, Object> variables = new HashMap<>();

        // Patient information
        variables.put("patientName", event.bill().getPatient().getName());

        // Essential refund details for push notification
        variables.put("billNumber", event.bill().getBillNumber());
        variables.put("billType", event.bill().getBillType().toString());
        variables.put("refundAmount", event.refundAmount().toString());
        variables.put("stripeRefundId", event.stripeRefundId());

        // System details
        variables.put("uiHost", frontendUrl);

        return variables;
    }

    /**
     * Sends email notifications to authorized family members
     */
    private void sendNotificationsToAuthorizedFamilyMembers(UUID patientId,
            Map<String, Object> emailVariables, Map<String, Object> pushVariables,
            EmailType emailType, NotificationType pushType) {
        try {
            // Find family members with MANAGE_APPOINTMENTS permission (includes billing
            // access)
            List<FamilyMember> authorizedFamilyMembers = familyMemberRepository
                    .findByPatientIdAndCanManageBillingTrueAndPendingFalse(patientId);

            for (FamilyMember familyMember : authorizedFamilyMembers) {
                try {
                    Patient familyMemberPatient = patientService.findPatientByAccountId(patientId);

                    if (familyMember.getMemberAccount() != null && familyMemberPatient.getEmail() != null) {
                        // Send email notification
                        sendEmailNotification(familyMemberPatient.getEmail(), emailType, emailVariables);
                        log.debug("Sent refund email to authorized family member: {}",
                                familyMemberPatient.getEmail());

                        // Send push notification
                        sendPushNotification(familyMember.getMemberAccount().getId(), pushType, pushVariables);
                        log.debug("Sent refund push notification to authorized family member account: {}",
                                familyMember.getMemberAccount().getId());
                    }
                } catch (Exception e) {
                    log.warn("Failed to send refund notification to family member {}: {}",
                            familyMember.getId(), e.getMessage());
                }
            }

            log.debug("Processed refund notifications for {} authorized family members",
                    authorizedFamilyMembers.size());
        } catch (Exception e) {
            log.error("Error sending notifications to authorized family members for patient {}: {}",
                    patientId, e.getMessage());
        }
    }

    /**
     * Sends email notification using the email factory registry
     */
    private void sendEmailNotification(String email, EmailType emailType, Map<String, Object> variables) {
        try {
            var emailSender = emailFactoryRegistry.getEmailSender(emailType);
            emailSender.sendEmail(email, variables);
            log.debug("Successfully sent {} email to: {}", emailType, email);
        } catch (Exception e) {
            log.error("Failed to send {} email to {}: {}", emailType, email, e.getMessage());
        }
    }

    /**
     * Sends push notification using the push notification factory registry
     */
    private void sendPushNotification(UUID accountId, NotificationType notificationType,
            Map<String, Object> variables) {
        try {
            pushSubscriptionService.sendNotificationByAccountId(accountId, notificationType, variables);
        } catch (Exception e) {
            log.error("Failed to send {} push notification to account {}: {}",
                    notificationType, accountId, e.getMessage());
        }
    }
}
