package com.mytelmed.infrastructure.push.constant;

import lombok.Getter;

/**
 * Push notification types for Malaysian public healthcare telemedicine system.
 * Supports both PHYSICAL and VIRTUAL appointment notifications.
 */
@Getter
public enum PushNotificationType {
    APPOINTMENT_REMINDER_PATIENT(PushNotificationFamily.APPOINTMENT),
    APPOINTMENT_REMINDER_PROVIDER(PushNotificationFamily.APPOINTMENT),
    APPOINTMENT_CONFIRMATION_PATIENT(PushNotificationFamily.APPOINTMENT),
    APPOINTMENT_CONFIRMATION_PROVIDER(PushNotificationFamily.APPOINTMENT),
    APPOINTMENT_CANCEL_PATIENT(PushNotificationFamily.APPOINTMENT),
    APPOINTMENT_CANCEL_PROVIDER(PushNotificationFamily.APPOINTMENT),
    APPOINTMENT_BOOKED_PATIENT(PushNotificationFamily.APPOINTMENT),
    APPOINTMENT_BOOKED_PROVIDER(PushNotificationFamily.APPOINTMENT),

    PRESCRIPTION_CREATED(PushNotificationFamily.PRESCRIPTION),
    PRESCRIPTION_EXPIRING(PushNotificationFamily.PRESCRIPTION),
    PRESCRIPTION_OUT_FOR_DELIVERY(PushNotificationFamily.PRESCRIPTION),

    DELIVERY_CREATED(PushNotificationFamily.DELIVERY),
    DELIVERY_PAYMENT_CONFIRMED(PushNotificationFamily.DELIVERY),
    DELIVERY_PROCESSING_STARTED(PushNotificationFamily.DELIVERY),
    DELIVERY_READY_FOR_PICKUP(PushNotificationFamily.DELIVERY),
    DELIVERY_CANCELLED(PushNotificationFamily.DELIVERY),
    DELIVERY_COMPLETED(PushNotificationFamily.DELIVERY),
    DELIVERY_OUT(PushNotificationFamily.DELIVERY),

    REFERRAL_CREATED(PushNotificationFamily.REFERRAL),
    REFERRAL_ACCEPTED(PushNotificationFamily.REFERRAL),
    REFERRAL_REJECTED(PushNotificationFamily.REFERRAL),
    REFERRAL_SCHEDULED(PushNotificationFamily.REFERRAL),

    REFUND_SUCCESS(PushNotificationFamily.PAYMENT);

    private final PushNotificationFamily family;

    PushNotificationType(PushNotificationFamily family) {
        this.family = family;
    }

    @Override
    public String toString() {
        return this.name().toUpperCase().replace('_', ' ');
    }
}
