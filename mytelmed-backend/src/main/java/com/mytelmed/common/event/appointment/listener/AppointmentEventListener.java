package com.mytelmed.common.event.appointment.listener;

import com.mytelmed.common.event.appointment.model.AppointmentBookedEvent;
import com.mytelmed.common.event.appointment.model.AppointmentCancelledEvent;
import com.mytelmed.common.event.appointment.model.AppointmentConfirmedEvent;
import com.mytelmed.common.event.appointment.model.UpcomingAppointmentReminderEvent;
import com.mytelmed.core.notification.service.PushSubscriptionService;
import com.mytelmed.infrastructure.email.constant.EmailType;
import com.mytelmed.infrastructure.email.factory.EmailSenderFactoryRegistry;
import com.mytelmed.infrastructure.push.constant.NotificationType;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;


@Slf4j
@Component
public class AppointmentEventListener {
    private final EmailSenderFactoryRegistry emailService;
    private final PushSubscriptionService pushSubscriptionService;
    private final String frontendUrl;

    public AppointmentEventListener(EmailSenderFactoryRegistry emailService,
                                    PushSubscriptionService pushSubscriptionService,
                                    @Value("${application.frontend.url}") String frontendUrl) {
        this.emailService = emailService;
        this.pushSubscriptionService = pushSubscriptionService;
        this.frontendUrl = frontendUrl;
    }

    @Async
    @EventListener
    public void handleAppointmentBooked(AppointmentBookedEvent event) {
        log.info("Handling appointment booked event for appointment ID: {}", event.appointmentId());

        try {
            // Build specific variables for each strategy
            Map<String, Object> patientEmailVariables = buildAppointmentBookedEmailVariables(event);
            Map<String, Object> providerEmailVariables = buildAppointmentBookedEmailVariables(event);
            Map<String, Object> patientPushVariables = buildAppointmentBookedPatientPushVariables(event);
            Map<String, Object> providerPushVariables = buildAppointmentBookedDoctorPushVariables(event);

            // Send email notifications
            sendEmailNotificationsForBooking(event, patientEmailVariables, providerEmailVariables);

            // Send push notifications with preference checks
            sendPushNotificationsForBooking(event, patientPushVariables, providerPushVariables);

            log.info("Appointment booking notifications sent successfully for appointment ID: {}",
                    event.appointmentId());

        } catch (Exception e) {
            log.error("Failed to send appointment booking notifications for appointment ID: {}",
                    event.appointmentId(), e);
        }
    }

    @Async
    @EventListener
    public void handleAppointmentConfirmed(AppointmentConfirmedEvent event) {
        log.info("Handling appointment confirmed event for appointment ID: {}", event.appointmentId());

        try {
            // Build specific variables for each strategy
            Map<String, Object> patientEmailVariables = buildAppointmentConfirmationEmailVariables(event);
            Map<String, Object> providerEmailVariables = buildAppointmentConfirmationEmailVariables(event);
            Map<String, Object> patientPushVariables = buildAppointmentConfirmationPatientPushVariables(event);
            Map<String, Object> providerPushVariables = buildAppointmentConfirmationDoctorPushVariables(event);

            // Send email notifications
            sendEmailNotifications(event, patientEmailVariables, providerEmailVariables);

            // Send push notifications with preference checks
            sendPushNotifications(event, patientPushVariables, providerPushVariables);

            log.info("Appointment confirmation notifications sent successfully for appointment ID: {}",
                    event.appointmentId());

        } catch (Exception e) {
            log.error("Failed to send appointment confirmation notifications for appointment ID: {}",
                    event.appointmentId(), e);
        }
    }

    @Async
    @EventListener
    public void handleAppointmentCancelled(AppointmentCancelledEvent event) {
        log.info("Handling appointment cancelled event for appointment ID: {}", event.appointmentId());

        try {
            // Build specific variables for each strategy
            Map<String, Object> patientEmailVariables = buildAppointmentCancellationEmailVariables(event);
            Map<String, Object> providerEmailVariables = buildAppointmentCancellationEmailVariables(event);
            Map<String, Object> patientPushVariables = buildAppointmentCancellationPatientPushVariables(event);
            Map<String, Object> providerPushVariables = buildAppointmentCancellationDoctorPushVariables(event);

            sendEmailNotificationsForCancellation(event, patientEmailVariables, providerEmailVariables);
            sendPushNotificationsForCancellation(event, patientPushVariables, providerPushVariables);

            log.info("Appointment cancellation notifications sent successfully for appointment ID: {}",
                    event.appointmentId());
        } catch (Exception e) {
            log.error("Failed to send appointment cancellation notifications for appointment ID: {}",
                    event.appointmentId(), e);
        }
    }

    @Async
    @EventListener
    public void handleAppointmentReminder(UpcomingAppointmentReminderEvent event) {
        log.info("Handling appointment reminder event for appointment ID: {}", event.appointmentId());

        try {
            // Build specific variables for each strategy
            Map<String, Object> patientEmailVariables = buildAppointmentReminderEmailVariables(event);
            Map<String, Object> providerEmailVariables = buildAppointmentReminderEmailVariables(event);
            Map<String, Object> patientPushVariables = buildAppointmentReminderPatientPushVariables(event);
            Map<String, Object> providerPushVariables = buildAppointmentReminderDoctorPushVariables(event);

            // Send email notifications
            sendEmailNotificationsForReminder(event, patientEmailVariables, providerEmailVariables);

            // Send push notifications
            sendPushNotificationsForReminder(event, patientPushVariables, providerPushVariables);

            log.info("Appointment reminder notifications sent successfully for appointment ID: {}",
                    event.appointmentId());

        } catch (Exception e) {
            log.error("Failed to send appointment reminder notifications for appointment ID: {}",
                    event.appointmentId(), e);
        }
    }

    // ===================================================================
    // EMAIL STRATEGY VARIABLE BUILDERS
    // ===================================================================

    // === APPOINTMENT BOOKING EMAIL VARIABLE BUILDERS ===

    private Map<String, Object> buildAppointmentBookedEmailVariables(AppointmentBookedEvent event) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("appointmentId", event.appointmentId().toString());
        variables.put("patientName", event.patient().getName());
        variables.put("providerName", event.doctor().getName());
        variables.put("appointmentDateTime", event.appointmentDateTime());
        variables.put("reasonForVisit", event.reasonForVisit());
        variables.put("patientNotes", event.patientNotes());
        variables.put("uiHost", frontendUrl);
        return variables;
    }

    // === APPOINTMENT CONFIRMATION EMAIL VARIABLE BUILDERS ===

    private Map<String, Object> buildAppointmentConfirmationEmailVariables(AppointmentConfirmedEvent event) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("appointmentId", event.appointmentId());
        variables.put("patientName", event.patient().getName());
        variables.put("providerName", event.providerName());
        variables.put("appointmentDateTime", event.appointmentDateTime());
        variables.put("reasonForVisit", event.reasonForVisit());
        variables.put("uiHost", frontendUrl);
        return variables;
    }

    // === APPOINTMENT CANCELLATION EMAIL VARIABLE BUILDERS ===

    private Map<String, Object> buildAppointmentCancellationEmailVariables(AppointmentCancelledEvent event) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("appointmentId", event.appointmentId());
        variables.put("patientName", event.patient().getName());
        variables.put("providerName", event.doctor().getName());
        variables.put("appointmentDateTime", event.appointmentDateTime());
        variables.put("reasonForVisit", event.reasonForVisit());
        variables.put("cancellationReason", event.cancellationReason());
        variables.put("uiHost", frontendUrl);
        return variables;
    }

    // === APPOINTMENT REMINDER EMAIL VARIABLE BUILDERS ===

    private Map<String, Object> buildAppointmentReminderEmailVariables(UpcomingAppointmentReminderEvent event) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("appointmentId", event.appointmentId());
        variables.put("patientName", event.patient().getName());
        variables.put("providerName", event.providerName());
        variables.put("appointmentDateTime", event.appointmentDateTime());
        variables.put("hoursUntilAppointment", event.hoursUntilAppointment());
        variables.put("reasonForVisit", event.reasonForVisit());
        variables.put("uiHost", frontendUrl);
        return variables;
    }

    // ===================================================================
    // PUSH STRATEGY VARIABLE BUILDERS
    // ===================================================================

    // === APPOINTMENT BOOKING PUSH VARIABLE BUILDERS ===

    private Map<String, Object> buildAppointmentBookedPatientPushVariables(AppointmentBookedEvent event) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("appointmentId", event.appointmentId().toString());
        variables.put("providerName", event.doctor().getName());
        variables.put("appointmentDateTime", event.appointmentDateTime());
        return variables;
    }

    private Map<String, Object> buildAppointmentBookedDoctorPushVariables(AppointmentBookedEvent event) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("appointmentId", event.appointmentId().toString());
        variables.put("patientName", event.patient().getName());
        variables.put("appointmentDateTime", event.appointmentDateTime());
        return variables;
    }

    // === APPOINTMENT CONFIRMATION PUSH VARIABLE BUILDERS ===

    private Map<String, Object> buildAppointmentConfirmationPatientPushVariables(AppointmentConfirmedEvent event) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("appointmentId", event.appointmentId().toString());
        variables.put("providerName", event.providerName());
        variables.put("appointmentDateTime", event.appointmentDateTime());
        return variables;
    }

    private Map<String, Object> buildAppointmentConfirmationDoctorPushVariables(AppointmentConfirmedEvent event) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("appointmentId", event.appointmentId().toString());
        variables.put("patientName", event.patient().getName());
        variables.put("appointmentDateTime", event.appointmentDateTime());
        return variables;
    }

    // === APPOINTMENT CANCELLATION PUSH VARIABLE BUILDERS ===

    private Map<String, Object> buildAppointmentCancellationPatientPushVariables(AppointmentCancelledEvent event) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("appointmentId", event.appointmentId().toString());
        variables.put("providerName", event.doctor().getName());
        variables.put("appointmentDateTime", event.appointmentDateTime());
        return variables;
    }

    private Map<String, Object> buildAppointmentCancellationDoctorPushVariables(AppointmentCancelledEvent event) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("appointmentId", event.appointmentId().toString());
        variables.put("patientName", event.patient().getName());
        variables.put("appointmentDateTime", event.appointmentDateTime());
        return variables;
    }

    // === APPOINTMENT REMINDER PUSH VARIABLE BUILDERS ===

    private Map<String, Object> buildAppointmentReminderPatientPushVariables(UpcomingAppointmentReminderEvent event) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("appointmentId", event.appointmentId().toString());
        variables.put("providerName", event.providerName());
        variables.put("hoursUntilAppointment", event.hoursUntilAppointment());
        variables.put("appointmentDateTime", event.appointmentDateTime());
        return variables;
    }

    private Map<String, Object> buildAppointmentReminderDoctorPushVariables(UpcomingAppointmentReminderEvent event) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("appointmentId", event.appointmentId().toString());
        variables.put("patientName", event.patient().getName());
        variables.put("hoursUntilAppointment", event.hoursUntilAppointment());
        variables.put("appointmentDateTime", event.appointmentDateTime());
        return variables;
    }

    // ===================================================================
    // NOTIFICATION SENDING METHODS
    // ===================================================================

    private void sendEmailNotifications(AppointmentConfirmedEvent event,
                                        Map<String, Object> patientVariables,
                                        Map<String, Object> providerVariables) {
        try {
            emailService.getEmailSender(EmailType.APPOINTMENT_CONFIRMATION_PATIENT)
                    .sendEmail(event.patient().getEmail(), patientVariables);

            emailService.getEmailSender(EmailType.APPOINTMENT_CONFIRMATION_DOCTOR)
                    .sendEmail(event.providerEmail(), providerVariables);
        } catch (Exception e) {
            log.error("Failed to send confirmation email notifications for appointment ID: {}",
                    event.appointmentId(), e);
        }
    }

    private void sendPushNotifications(AppointmentConfirmedEvent event,
                                       Map<String, Object> patientVariables,
                                       Map<String, Object> providerVariables) {
        try {
            sendPushNotification(event.patient().getAccount().getId(),
                    NotificationType.APPOINTMENT_CONFIRMATION_PATIENT, patientVariables);

            // Send to provider
            sendPushNotification(event.providerAccountId(),
                    NotificationType.APPOINTMENT_CONFIRMATION_PROVIDER, providerVariables);
        } catch (Exception e) {
            log.error("Failed to send confirmation push notifications for appointment ID: {}",
                    event.appointmentId(), e);
        }
    }

    private void sendEmailNotificationsForCancellation(AppointmentCancelledEvent event,
                                                       Map<String, Object> patientVariables,
                                                       Map<String, Object> providerVariables) {
        try {
            emailService.getEmailSender(EmailType.APPOINTMENT_CANCEL_PATIENT)
                    .sendEmail(event.patient().getEmail(), patientVariables);

            emailService.getEmailSender(EmailType.APPOINTMENT_CANCEL_DOCTOR)
                    .sendEmail(event.doctor().getEmail(), providerVariables);
        } catch (Exception e) {
            log.error("Failed to send cancellation email notifications for appointment ID: {}",
                    event.appointmentId(), e);
        }
    }

    private void sendPushNotificationsForCancellation(AppointmentCancelledEvent event,
                                                      Map<String, Object> patientVariables,
                                                      Map<String, Object> providerVariables) {
        try {
            sendPushNotification(event.patient().getAccount().getId(),
                    NotificationType.APPOINTMENT_CANCEL_PATIENT, patientVariables);

            sendPushNotification(event.doctor().getAccount().getId(),
                    NotificationType.APPOINTMENT_CANCEL_PROVIDER, providerVariables);
        } catch (Exception e) {
            log.error("Failed to send cancellation push notifications for appointment ID: {}",
                    event.appointmentId(), e);
        }
    }

    private void sendEmailNotificationsForReminder(UpcomingAppointmentReminderEvent event,
                                                   Map<String, Object> patientVariables,
                                                   Map<String, Object> providerVariables) {
        try {
            emailService.getEmailSender(EmailType.APPOINTMENT_REMINDER_PATIENT)
                    .sendEmail(event.patient().getEmail(), patientVariables);

            emailService.getEmailSender(EmailType.APPOINTMENT_REMINDER_DOCTOR)
                    .sendEmail(event.providerEmail(), providerVariables);
        } catch (Exception e) {
            log.error("Failed to send reminder email notifications for appointment ID: {}",
                    event.appointmentId(), e);
        }
    }

    private void sendPushNotificationsForReminder(UpcomingAppointmentReminderEvent event,
                                                  Map<String, Object> patientVariables,
                                                  Map<String, Object> providerVariables) {
        try {
            sendPushNotification(event.patient().getAccount().getId(),
                    NotificationType.APPOINTMENT_REMINDER_PATIENT, patientVariables);

            sendPushNotification(event.providerAccountId(),
                    NotificationType.APPOINTMENT_REMINDER_PROVIDER, providerVariables);
        } catch (Exception e) {
            log.error("Failed to send reminder push notifications for appointment ID: {}",
                    event.appointmentId(), e);
        }
    }

    private void sendEmailNotificationsForBooking(AppointmentBookedEvent event,
                                                  Map<String, Object> patientVariables,
                                                  Map<String, Object> providerVariables) {
        try {
            emailService.getEmailSender(EmailType.APPOINTMENT_BOOKED_PATIENT)
                    .sendEmail(event.patient().getEmail(), patientVariables);

            emailService.getEmailSender(EmailType.APPOINTMENT_BOOKED_DOCTOR)
                    .sendEmail(event.doctor().getEmail(), providerVariables);
        } catch (Exception e) {
            log.error("Failed to send booking email notifications for appointment ID: {}",
                    event.appointmentId(), e);
        }
    }

    private void sendPushNotificationsForBooking(AppointmentBookedEvent event,
                                                 Map<String, Object> patientVariables,
                                                 Map<String, Object> providerVariables) {
        try {
            sendPushNotification(event.patient().getAccount().getId(),
                    NotificationType.APPOINTMENT_BOOKED_PATIENT, patientVariables);

            sendPushNotification(event.doctor().getAccount().getId(),
                    NotificationType.APPOINTMENT_BOOKED_PROVIDER, providerVariables);
        } catch (Exception e) {
            log.error("Failed to send booking push notifications for appointment ID: {}",
                    event.appointmentId(), e);
        }
    }

    // ===================================================================
    // UTILITY METHODS
    // ===================================================================

    private void sendPushNotification(UUID accountId, NotificationType notificationType,
                                      Map<String, Object> variables) {
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
