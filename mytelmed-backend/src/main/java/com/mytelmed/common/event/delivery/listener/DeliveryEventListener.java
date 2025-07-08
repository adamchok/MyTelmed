package com.mytelmed.common.event.delivery.listener;

import com.mytelmed.common.event.delivery.model.DeliveryCompletedEvent;
import com.mytelmed.common.event.delivery.model.DeliveryCreatedEvent;
import com.mytelmed.common.event.delivery.model.DeliveryOutForDeliveryEvent;
import com.mytelmed.core.notification.service.PushSubscriptionService;
import com.mytelmed.infrastructure.email.constant.EmailType;
import com.mytelmed.infrastructure.email.factory.EmailSenderFactoryRegistry;
import com.mytelmed.infrastructure.push.constant.NotificationType;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.time.ZoneId;
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
          EmailType.PRESCRIPTION_CREATED, emailVariables);

      // Send push notification to patient
      sendPushNotification(event.delivery().getPrescription().getPatient().getAccount().getId(),
          NotificationType.PRESCRIPTION_CREATED, pushVariables);

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
          EmailType.PRESCRIPTION_OUT_FOR_DELIVERY, emailVariables);

      // Send push notification to patient
      sendPushNotification(event.delivery().getPrescription().getPatient().getAccount().getId(),
          NotificationType.PRESCRIPTION_OUT_FOR_DELIVERY, pushVariables);

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
          EmailType.PRESCRIPTION_CREATED, emailVariables); // Use generic type for now

      // Send push notification to patient
      sendPushNotification(event.delivery().getPrescription().getPatient().getAccount().getId(),
          NotificationType.PRESCRIPTION_CREATED, pushVariables); // Use generic type for now

      log.info("Successfully sent delivery completed notifications for delivery: {}",
          event.delivery().getId());
    } catch (Exception e) {
      log.error("Error sending delivery completed notifications for delivery: {}",
          event.delivery().getId(), e);
    }
  }

  // Private helper methods for building variables

  private Map<String, Object> buildDeliveryCreatedEmailVariables(DeliveryCreatedEvent event) {
    Map<String, Object> variables = new HashMap<>();
    variables.put("patientName", event.delivery().getPrescription().getPatient().getFirstName() + " " +
        event.delivery().getPrescription().getPatient().getLastName());
    variables.put("prescriptionNumber", event.delivery().getPrescription().getPrescriptionNumber());
    variables.put("deliveryMethod", event.delivery().getDeliveryMethod().toString());
    variables.put("facilityName", event.delivery().getPrescription().getFacility().getName());
    variables.put("uiHost", frontendUrl);
    return variables;
  }

  private Map<String, Object> buildDeliveryCreatedPushVariables(DeliveryCreatedEvent event) {
    Map<String, Object> variables = new HashMap<>();
    variables.put("prescriptionId", event.delivery().getPrescription().getId().toString());
    variables.put("deliveryMethod", event.delivery().getDeliveryMethod().toString());
    return variables;
  }

  private Map<String, Object> buildOutForDeliveryEmailVariables(DeliveryOutForDeliveryEvent event) {
    Map<String, Object> variables = new HashMap<>();
    variables.put("patientName", event.delivery().getPrescription().getPatient().getFirstName() + " " +
        event.delivery().getPrescription().getPatient().getLastName());
    variables.put("prescriptionNumber", event.delivery().getPrescription().getPrescriptionNumber());
    variables.put("trackingReference", event.delivery().getTrackingReference());
    variables.put("courierName", event.delivery().getCourierName());
    variables.put("estimatedDeliveryDate", event.delivery().getEstimatedDeliveryDate());
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
    variables.put("patientName", event.delivery().getPrescription().getPatient().getFirstName() + " " +
        event.delivery().getPrescription().getPatient().getLastName());
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