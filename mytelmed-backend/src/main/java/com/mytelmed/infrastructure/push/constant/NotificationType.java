package com.mytelmed.infrastructure.push.constant;

import lombok.Getter;


@Getter
public enum NotificationType {
    APPOINTMENT_REMINDER_PATIENT(NotificationFamily.APPOINTMENT),
    APPOINTMENT_REMINDER_PROVIDER(NotificationFamily.APPOINTMENT),
    APPOINTMENT_CONFIRMATION_PATIENT(NotificationFamily.APPOINTMENT),
    APPOINTMENT_CONFIRMATION_PROVIDER(NotificationFamily.APPOINTMENT),
    APPOINTMENT_CANCEL_PATIENT(NotificationFamily.APPOINTMENT),
    APPOINTMENT_CANCEL_PROVIDER(NotificationFamily.APPOINTMENT),
    APPOINTMENT_BOOKED_PATIENT(NotificationFamily.APPOINTMENT),
    APPOINTMENT_BOOKED_PROVIDER(NotificationFamily.APPOINTMENT),

    PRESCRIPTION_CREATED(NotificationFamily.PRESCRIPTION),
    PRESCRIPTION_EXPIRING(NotificationFamily.PRESCRIPTION),
    PRESCRIPTION_OUT_FOR_DELIVERY(NotificationFamily.PRESCRIPTION);

    private final NotificationFamily family;

    NotificationType(NotificationFamily family) {
        this.family = family;
    }

    @Override
    public String toString() {
        return this.name().toUpperCase().replace('_', ' ');
    }
}
