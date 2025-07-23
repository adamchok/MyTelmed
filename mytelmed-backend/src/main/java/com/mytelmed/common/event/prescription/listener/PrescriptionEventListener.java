package com.mytelmed.common.event.prescription.listener;

import com.mytelmed.common.event.prescription.model.PrescriptionCreatedEvent;
import com.mytelmed.common.event.prescription.model.PrescriptionExpiringEvent;
import com.mytelmed.core.notification.service.PushSubscriptionService;
import com.mytelmed.core.prescription.entity.Prescription;
import com.mytelmed.infrastructure.email.constant.EmailType;
import com.mytelmed.infrastructure.email.factory.EmailSenderFactoryRegistry;
import com.mytelmed.infrastructure.push.constant.PushNotificationType;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Component
public class PrescriptionEventListener {
    private final EmailSenderFactoryRegistry emailService;
    private final PushSubscriptionService pushSubscriptionService;
    private final String frontendUrl;

    public PrescriptionEventListener(EmailSenderFactoryRegistry emailService,
            PushSubscriptionService pushSubscriptionService,
            @Value("${application.frontend.url}") String frontendUrl) {
        this.emailService = emailService;
        this.pushSubscriptionService = pushSubscriptionService;
        this.frontendUrl = frontendUrl;
    }

    @Async
    @EventListener
    public void handlePrescriptionCreated(PrescriptionCreatedEvent event) {
        log.info("Handling prescription created event for prescription: {}", event.prescription().getId());

        try {
            // Build specific variables for each strategy
            Map<String, Object> emailVariables = buildPrescriptionCreatedEmailVariables(event);
            Map<String, Object> pushVariables = buildPrescriptionCreatedPushVariables(event);

            // Send email notifications
            sendEmailNotificationsForCreation(event.prescription(), emailVariables);

            // Send push notifications
            sendPushNotificationsForCreation(event.prescription(), pushVariables);

            log.info("Successfully sent prescription created notifications for prescription: {}",
                    event.prescription().getId());
        } catch (Exception e) {
            log.error("Error sending prescription created notifications for prescription: {}",
                    event.prescription().getId(), e);
        }
    }

    // Note: Out-for-delivery events are now handled by DeliveryEventListener
    // since delivery concerns have been separated from prescription concerns

    @Async
    @EventListener
    public void handlePrescriptionExpiring(PrescriptionExpiringEvent event) {
        log.info("Handling prescription expiring event for prescription: {}", event.prescription().getId());

        try {
            // Build specific variables for each strategy
            Map<String, Object> patientEmailVariables = buildPrescriptionExpiringEmailVariables(
                    event);
            Map<String, Object> patientPushVariables = buildPrescriptionExpiringPatientPushVariables(event);

            // Send email notifications
            sendEmailNotificationsForExpiring(event, patientEmailVariables);

            // Send push notifications
            sendPushNotificationsForExpiring(event, patientPushVariables);

            log.info("Successfully sent prescription expiring notifications for prescription: {}",
                    event.prescription().getId());

        } catch (Exception e) {
            log.error("Error sending prescription expiring notifications for prescription: {}",
                    event.prescription().getId(), e);
        }
    }

    // ===================================================================
    // EMAIL STRATEGY VARIABLE BUILDERS
    // ===================================================================

    // === PRESCRIPTION CREATED EMAIL VARIABLE BUILDERS ===

    private Map<String, Object> buildPrescriptionCreatedEmailVariables(PrescriptionCreatedEvent event) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("prescriptionId", event.prescription().getId().toString());
        variables.put("patientName", event.prescription().getPatient().getName());
        variables.put("doctorName", event.prescription().getDoctor().getName());
        variables.put("facilityName", event.prescription().getFacility().getName());
        variables.put("uiHost", frontendUrl);

        variables.put(
                "expiryDate",
                event.prescription().getExpiryDate()
                        .atZone(ZoneId.of("Asia/Kuala_Lumpur"))
                        .toLocalDate());

        return variables;
    }

    // === PRESCRIPTION EXPIRING EMAIL VARIABLE BUILDERS ===

    private Map<String, Object> buildPrescriptionExpiringEmailVariables(PrescriptionExpiringEvent event) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("prescriptionId", event.prescription().getId().toString());
        variables.put("patientName", event.prescription().getPatient().getName());
        variables.put("daysUntilExpiry", event.daysUntilExpiry());
        variables.put("uiHost", frontendUrl);

        variables.put(
                "expiryDate",
                event.prescription().getExpiryDate()
                        .atZone(ZoneId.of("Asia/Kuala_Lumpur"))
                        .toLocalDate());

        return variables;
    }

    // Note: Out-for-delivery variable builders removed - handled by
    // DeliveryEventListener

    // ===================================================================
    // PUSH STRATEGY VARIABLE BUILDERS
    // ===================================================================

    // === PRESCRIPTION CREATED PUSH VARIABLE BUILDERS ===

    private Map<String, Object> buildPrescriptionCreatedPushVariables(PrescriptionCreatedEvent event) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("prescriptionId", event.prescription().getId().toString());
        variables.put("doctorName", event.prescription().getDoctor().getName());
        variables.put("facilityName", event.prescription().getFacility().getName());
        variables.put("expiryDate", event.prescription().getExpiryDate());
        return variables;
    }

    // === PRESCRIPTION EXPIRING PUSH VARIABLE BUILDERS ===

    private Map<String, Object> buildPrescriptionExpiringPatientPushVariables(PrescriptionExpiringEvent event) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("prescriptionId", event.prescription().getId().toString());
        variables.put("expiryDate", event.prescription().getExpiryDate());
        return variables;
    }

    // Note: Out-for-delivery push variables removed - handled by
    // DeliveryEventListener

    // ===================================================================
    // NOTIFICATION SENDING METHODS
    // ===================================================================

    private void sendEmailNotificationsForCreation(Prescription prescription,
            Map<String, Object> variables) {
        try {
            emailService.getEmailSender(EmailType.PRESCRIPTION_CREATED)
                    .sendEmail(prescription.getPatient().getEmail(), variables);
        } catch (Exception e) {
            log.error("Failed to send prescription creation email notifications for prescription ID: {}",
                    prescription.getId(), e);
        }
    }

    private void sendPushNotificationsForCreation(Prescription prescription,
            Map<String, Object> patientVariables) {
        try {
            sendPushNotification(prescription.getPatient().getAccount().getId(),
                    PushNotificationType.PRESCRIPTION_CREATED, patientVariables);
        } catch (Exception e) {
            log.error("Failed to send prescription creation push notifications for prescription ID: {}",
                    prescription.getId(), e);
        }
    }

    private void sendEmailNotificationsForExpiring(PrescriptionExpiringEvent event,
            Map<String, Object> patientVariables) {
        try {
            emailService.getEmailSender(EmailType.PRESCRIPTION_EXPIRING)
                    .sendEmail(event.prescription().getPatient().getEmail(), patientVariables);
        } catch (Exception e) {
            log.error("Failed to send prescription expiring email notifications for prescription ID: {}",
                    event.prescription().getId(), e);
        }
    }

    private void sendPushNotificationsForExpiring(PrescriptionExpiringEvent event,
            Map<String, Object> patientVariables) {
        try {
            sendPushNotification(event.prescription().getPatient().getAccount().getId(),
                    PushNotificationType.PRESCRIPTION_EXPIRING, patientVariables);
        } catch (Exception e) {
            log.error("Failed to send prescription expiring push notifications for prescription ID: {}",
                    event.prescription().getId(), e);
        }
    }

    // Note: Delivery notification methods removed - handled by
    // DeliveryEventListener

    // ===================================================================
    // UTILITY METHODS
    // ===================================================================

    private void sendPushNotification(UUID accountId, PushNotificationType notificationType,
            Map<String, Object> variables) {
        try {
            if (accountId == null) {
                log.warn("Cannot send push notification: account ID is null for type: {}",
                        notificationType);
                return;
            }

            log.debug("Sending push notification to account {} for type: {}", accountId, notificationType);
            pushSubscriptionService.sendNotificationByAccountId(accountId, notificationType, variables);

        } catch (Exception e) {
            log.warn("Failed to send push notification to account {}: {}", accountId, e.getMessage());
        }
    }
}
