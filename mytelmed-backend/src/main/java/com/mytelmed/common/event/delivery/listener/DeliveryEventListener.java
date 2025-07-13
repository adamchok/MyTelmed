package com.mytelmed.common.event.delivery.listener;

import com.mytelmed.common.event.delivery.model.DeliveryCancelledEvent;
import com.mytelmed.common.event.delivery.model.DeliveryCompletedEvent;
import com.mytelmed.common.event.delivery.model.DeliveryCreatedEvent;
import com.mytelmed.common.event.delivery.model.DeliveryOutForDeliveryEvent;
import com.mytelmed.common.event.delivery.model.DeliveryPaymentConfirmedEvent;
import com.mytelmed.common.event.delivery.model.DeliveryProcessingStartedEvent;
import com.mytelmed.common.event.delivery.model.DeliveryReadyForPickupEvent;
import com.mytelmed.core.delivery.entity.MedicationDelivery;
import com.mytelmed.core.notification.service.PushSubscriptionService;
import com.mytelmed.infrastructure.email.constant.EmailType;
import com.mytelmed.infrastructure.email.factory.EmailSenderFactoryRegistry;
import com.mytelmed.infrastructure.push.constant.NotificationType;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;


/**
 * Event listener for medication delivery events in Malaysian public healthcare
 * telemedicine.
 * Handles notifications for delivery-related activities.
 */
@Slf4j
@Component
public class DeliveryEventListener {

    private final EmailSenderFactoryRegistry emailService;
    private final PushSubscriptionService pushSubscriptionService;
    private final String frontendUrl;
    private final DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm");

    public DeliveryEventListener(EmailSenderFactoryRegistry emailService,
                                 PushSubscriptionService pushSubscriptionService,
                                 @Value("${application.frontend.url}") String frontendUrl) {
        this.emailService = emailService;
        this.pushSubscriptionService = pushSubscriptionService;
        this.frontendUrl = frontendUrl;
    }

    @Async
    @EventListener
    public void handleDeliveryCreated(DeliveryCreatedEvent event) {
        log.info("Handling delivery created event for delivery: {}", event.delivery().getId());

        try {
            Map<String, Object> emailVariables = buildDeliveryCreatedEmailVariables(event);
            Map<String, Object> pushVariables = buildDeliveryCreatedPushVariables(event);

            // Send email notification to patient
            sendEmailNotification(event.delivery().getPrescription().getPatient().getEmail(),
                    EmailType.DELIVERY_CREATED, emailVariables);

            // Send push notification to patient
            sendPushNotification(event.delivery().getPrescription().getPatient().getAccount().getId(),
                    NotificationType.DELIVERY_CREATED, pushVariables);

            log.info("Successfully sent delivery created notifications for delivery: {}",
                    event.delivery().getId());
        } catch (Exception e) {
            log.error("Error sending delivery created notifications for delivery: {}",
                    event.delivery().getId(), e);
        }
    }

    @Async
    @EventListener
    public void handleDeliveryOutForDelivery(DeliveryOutForDeliveryEvent event) {
        log.info("Handling delivery out-for-delivery event for delivery: {}", event.delivery().getId());

        try {
            Map<String, Object> emailVariables = buildOutForDeliveryEmailVariables(event);
            Map<String, Object> pushVariables = buildOutForDeliveryPushVariables(event);

            // Send email notification to patient
            sendEmailNotification(event.delivery().getPrescription().getPatient().getEmail(),
                    EmailType.DELIVERY_OUT, emailVariables);

            // Send push notification to patient
            sendPushNotification(event.delivery().getPrescription().getPatient().getAccount().getId(),
                    NotificationType.DELIVERY_OUT, pushVariables);

            log.info("Successfully sent out-for-delivery notifications for delivery: {}",
                    event.delivery().getId());
        } catch (Exception e) {
            log.error("Error sending out-for-delivery notifications for delivery: {}",
                    event.delivery().getId(), e);
        }
    }

    @Async
    @EventListener
    public void handleDeliveryCompleted(DeliveryCompletedEvent event) {
        log.info("Handling delivery completed event for delivery: {}", event.delivery().getId());

        try {
            Map<String, Object> emailVariables = buildDeliveryCompletedEmailVariables(event);
            Map<String, Object> pushVariables = buildDeliveryCompletedPushVariables(event);

            // Send email notification to patient
            sendEmailNotification(event.delivery().getPrescription().getPatient().getEmail(),
                    EmailType.DELIVERY_COMPLETED, emailVariables);

            // Send push notification to patient
            sendPushNotification(event.delivery().getPrescription().getPatient().getAccount().getId(),
                    NotificationType.DELIVERY_COMPLETED, pushVariables);

            log.info("Successfully sent delivery completed notifications for delivery: {}",
                    event.delivery().getId());
        } catch (Exception e) {
            log.error("Error sending delivery completed notifications for delivery: {}",
                    event.delivery().getId(), e);
        }
    }

    @Async
    @EventListener
    public void handleDeliveryCancelled(DeliveryCancelledEvent event) {
        log.info("Handling delivery cancelled event for delivery: {}", event.delivery().getId());

        try {
            Map<String, Object> emailVariables = buildDeliveryCancelledEmailVariables(event);
            Map<String, Object> pushVariables = buildDeliveryCancelledPushVariables(event);

            // Send email notification to patient
            sendEmailNotification(event.delivery().getPrescription().getPatient().getEmail(),
                    EmailType.DELIVERY_CANCELLED, emailVariables);

            // Send push notification to patient
            sendPushNotification(event.delivery().getPrescription().getPatient().getAccount().getId(),
                    NotificationType.DELIVERY_CANCELLED, pushVariables);

            log.info("Successfully sent delivery cancelled notifications for delivery: {}",
                    event.delivery().getId());
        } catch (Exception e) {
            log.error("Error sending delivery cancelled notifications for delivery: {}",
                    event.delivery().getId(), e);
        }
    }

    @Async
    @EventListener
    public void handleDeliveryPaymentConfirmed(DeliveryPaymentConfirmedEvent event) {
        log.info("Handling delivery payment confirmed event for delivery: {}", event.delivery().getId());

        try {
            MedicationDelivery delivery = event.delivery();
            String patientEmail = delivery.getPrescription().getPatient().getEmail();
            UUID patientAccountId = delivery.getPrescription().getPatient().getAccount().getId();

            // Send email notification
            Map<String, Object> emailVariables = buildDeliveryPaymentConfirmedEmailVariables(event);
            sendEmailNotification(patientEmail, EmailType.DELIVERY_PAYMENT_CONFIRMED, emailVariables);

            // Send push notification
            Map<String, Object> pushVariables = buildDeliveryPaymentConfirmedPushVariables(event);
            sendPushNotification(patientAccountId, NotificationType.DELIVERY_PAYMENT_CONFIRMED, pushVariables);

            log.info("Successfully sent delivery payment confirmed notifications for delivery: {}",
                    event.delivery().getId());
        } catch (Exception e) {
            log.error("Error sending delivery payment confirmed notifications for delivery: {}",
                    event.delivery().getId(), e);
        }
    }

    @Async
    @EventListener
    public void handleDeliveryProcessingStarted(DeliveryProcessingStartedEvent event) {
        log.info("Handling delivery processing started event for delivery: {}", event.delivery().getId());

        try {
            MedicationDelivery delivery = event.delivery();
            String patientEmail = delivery.getPrescription().getPatient().getEmail();
            UUID patientAccountId = delivery.getPrescription().getPatient().getAccount().getId();

            // Send email notification
            Map<String, Object> emailVariables = buildDeliveryProcessingStartedEmailVariables(event);
            sendEmailNotification(patientEmail, EmailType.DELIVERY_PROCESSING_STARTED, emailVariables);

            // Send push notification
            Map<String, Object> pushVariables = buildDeliveryProcessingStartedPushVariables(event);
            sendPushNotification(patientAccountId, NotificationType.DELIVERY_PROCESSING_STARTED, pushVariables);

            log.info("Successfully sent delivery processing started notifications for delivery: {}",
                    event.delivery().getId());
        } catch (Exception e) {
            log.error("Error sending delivery processing started notifications for delivery: {}",
                    event.delivery().getId(), e);
        }
    }

    @Async
    @EventListener
    public void handleDeliveryReadyForPickup(DeliveryReadyForPickupEvent event) {
        log.info("Handling delivery ready for pickup event for delivery: {}", event.delivery().getId());

        try {
            MedicationDelivery delivery = event.delivery();
            String patientEmail = delivery.getPrescription().getPatient().getEmail();
            UUID patientAccountId = delivery.getPrescription().getPatient().getAccount().getId();

            // Send email notification
            Map<String, Object> emailVariables = buildDeliveryReadyForPickupEmailVariables(event);
            sendEmailNotification(patientEmail, EmailType.DELIVERY_READY_FOR_PICKUP, emailVariables);

            // Send push notification
            Map<String, Object> pushVariables = buildDeliveryReadyForPickupPushVariables(event);
            sendPushNotification(patientAccountId, NotificationType.DELIVERY_READY_FOR_PICKUP, pushVariables);

            log.info("Successfully sent delivery ready for pickup notifications for delivery: {}",
                    event.delivery().getId());
        } catch (Exception e) {
            log.error("Error sending delivery ready for pickup notifications for delivery: {}",
                    event.delivery().getId(), e);
        }
    }

    // Private helper methods for building variables

    private Map<String, Object> buildDeliveryCreatedEmailVariables(DeliveryCreatedEvent event) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("patientName", event.delivery().getPrescription().getPatient().getName());
        variables.put("prescriptionNumber", event.delivery().getPrescription().getPrescriptionNumber());
        variables.put("deliveryMethod", event.delivery().getDeliveryMethod().toString());
        variables.put("facilityName", event.delivery().getPrescription().getFacility().getName());
        variables.put("deliveryAddress", buildDeliveryAddress(event.delivery()));
        variables.put("uiHost", frontendUrl);
        return variables;
    }

    private Map<String, Object> buildDeliveryCreatedPushVariables(DeliveryCreatedEvent event) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("prescriptionId", event.delivery().getPrescription().getId().toString());
        variables.put("deliveryMethod", event.delivery().getDeliveryMethod().toString());
        variables.put("facilityName", event.delivery().getPrescription().getFacility().getName());
        return variables;
    }

    private Map<String, Object> buildOutForDeliveryEmailVariables(DeliveryOutForDeliveryEvent event) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("patientName", event.delivery().getPrescription().getPatient().getName());
        variables.put("prescriptionNumber", event.delivery().getPrescription().getPrescriptionNumber());
        variables.put("trackingReference", event.delivery().getTrackingReference());
        variables.put("courierName", event.delivery().getCourierName());
        variables.put("deliveryAddress", buildDeliveryAddress(event.delivery()));
        variables.put("estimatedDeliveryDate", event.delivery().getEstimatedDeliveryDate() != null ? 
                event.delivery().getEstimatedDeliveryDate().atZone(java.time.ZoneId.systemDefault()).format(dateFormatter) : 
                "1-3 business days");
        variables.put("uiHost", frontendUrl);
        return variables;
    }

    private Map<String, Object> buildOutForDeliveryPushVariables(DeliveryOutForDeliveryEvent event) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("prescriptionId", event.delivery().getPrescription().getId().toString());
        variables.put("trackingReference", event.delivery().getTrackingReference());
        variables.put("courierName", event.delivery().getCourierName());
        return variables;
    }

    private Map<String, Object> buildDeliveryCompletedEmailVariables(DeliveryCompletedEvent event) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("patientName", event.delivery().getPrescription().getPatient().getName());
        variables.put("prescriptionNumber", event.delivery().getPrescription().getPrescriptionNumber());
        variables.put("deliveryMethod", event.delivery().getDeliveryMethod().toString());
        variables.put("uiHost", frontendUrl);
        return variables;
    }

    private Map<String, Object> buildDeliveryCompletedPushVariables(DeliveryCompletedEvent event) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("prescriptionId", event.delivery().getPrescription().getId().toString());
        variables.put("deliveryMethod", event.delivery().getDeliveryMethod().toString());
        return variables;
    }

    private Map<String, Object> buildDeliveryCancelledEmailVariables(DeliveryCancelledEvent event) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("patientName", event.delivery().getPrescription().getPatient().getName());
        variables.put("prescriptionNumber", event.delivery().getPrescription().getPrescriptionNumber());
        variables.put("deliveryMethod", event.delivery().getDeliveryMethod().toString());
        variables.put("cancellationReason", event.reason());
        variables.put("facilityName", event.delivery().getPrescription().getFacility().getName());
        variables.put("uiHost", frontendUrl);
        return variables;
    }

    private Map<String, Object> buildDeliveryCancelledPushVariables(DeliveryCancelledEvent event) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("prescriptionId", event.delivery().getPrescription().getId().toString());
        variables.put("deliveryMethod", event.delivery().getDeliveryMethod().toString());
        variables.put("cancellationReason", event.reason());
        return variables;
    }

    private Map<String, Object> buildDeliveryPaymentConfirmedEmailVariables(DeliveryPaymentConfirmedEvent event) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("patientName", event.delivery().getPrescription().getPatient().getName());
        variables.put("prescriptionNumber", event.delivery().getPrescription().getPrescriptionNumber());
        variables.put("deliveryMethod", event.delivery().getDeliveryMethod().toString());
        variables.put("facilityName", event.delivery().getPrescription().getFacility().getName());
        variables.put("uiHost", frontendUrl);
        return variables;
    }

    private Map<String, Object> buildDeliveryPaymentConfirmedPushVariables(DeliveryPaymentConfirmedEvent event) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("prescriptionId", event.delivery().getPrescription().getId().toString());
        variables.put("deliveryMethod", event.delivery().getDeliveryMethod().toString());
        return variables;
    }

    private Map<String, Object> buildDeliveryProcessingStartedEmailVariables(DeliveryProcessingStartedEvent event) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("patientName", event.delivery().getPrescription().getPatient().getName());
        variables.put("prescriptionNumber", event.delivery().getPrescription().getPrescriptionNumber());
        variables.put("deliveryMethod", event.delivery().getDeliveryMethod().toString());
        variables.put("facilityName", event.delivery().getPrescription().getFacility().getName());
        variables.put("uiHost", frontendUrl);
        return variables;
    }

    private Map<String, Object> buildDeliveryProcessingStartedPushVariables(DeliveryProcessingStartedEvent event) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("prescriptionId", event.delivery().getPrescription().getId().toString());
        variables.put("deliveryMethod", event.delivery().getDeliveryMethod().toString());
        return variables;
    }

    private Map<String, Object> buildDeliveryReadyForPickupEmailVariables(DeliveryReadyForPickupEvent event) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("patientName", event.delivery().getPrescription().getPatient().getName());
        variables.put("prescriptionNumber", event.delivery().getPrescription().getPrescriptionNumber());
        variables.put("facilityName", event.delivery().getPrescription().getFacility().getName());
        variables.put("facilityAddress", event.delivery().getPrescription().getFacility().getAddress());
        variables.put("uiHost", frontendUrl);
        return variables;
    }

    private Map<String, Object> buildDeliveryReadyForPickupPushVariables(DeliveryReadyForPickupEvent event) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("prescriptionId", event.delivery().getPrescription().getId().toString());
        variables.put("facilityName", event.delivery().getPrescription().getFacility().getName());
        return variables;
    }

    private String buildDeliveryAddress(MedicationDelivery delivery) {
        if (delivery.getDeliveryAddress() == null) {
            return "N/A";
        }
        return String.format("%s, %s, %s, %s",
                delivery.getDeliveryAddress(),
                delivery.getDeliveryCity(),
                delivery.getDeliveryState(),
                delivery.getDeliveryPostcode());
    }

    private void sendEmailNotification(String recipientEmail, EmailType emailType, Map<String, Object> variables) {
        try {
            emailService.getEmailSender(emailType).sendEmail(recipientEmail, variables);
        } catch (Exception e) {
            log.error("Failed to send email notification to: {}", recipientEmail, e);
        }
    }

    private void sendPushNotification(UUID accountId, NotificationType notificationType, Map<String, Object> variables) {
        try {
            if (accountId == null) {
                log.warn("Cannot send push notification: account ID is null for type: {}", notificationType);
                return;
            }

            log.debug("Sending push notification to account {} for type: {}", accountId, notificationType);
            pushSubscriptionService.sendNotificationByAccountId(accountId, notificationType, variables);

        } catch (Exception e) {
            log.warn("Failed to send push notification to account {}: {}", accountId, e.getMessage());
        }
    }
}