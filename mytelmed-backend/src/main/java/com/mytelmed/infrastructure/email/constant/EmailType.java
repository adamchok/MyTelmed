package com.mytelmed.infrastructure.email.constant;

import lombok.Getter;


/**
 * Email types for Malaysian public healthcare telemedicine system.
 * Supports both PHYSICAL and VIRTUAL appointment notifications.
 */
@Getter
public enum EmailType {
    PASSWORD_RESET(EmailFamily.ACCOUNT),
    EMAIL_RESET(EmailFamily.ACCOUNT),
    EMAIL_VERIFICATION(EmailFamily.ACCOUNT),

    ACCOUNT_CREATED(EmailFamily.ACCOUNT),
    ACCOUNT_ACTIVATED(EmailFamily.ACCOUNT),
    ACCOUNT_DEACTIVATED(EmailFamily.ACCOUNT),
    ACCOUNT_DELETED(EmailFamily.ACCOUNT),
    ACCOUNT_PASSWORD_RESET(EmailFamily.ACCOUNT),

    APPOINTMENT_REMINDER_PATIENT(EmailFamily.APPOINTMENT),
    APPOINTMENT_REMINDER_DOCTOR(EmailFamily.APPOINTMENT),
    APPOINTMENT_CONFIRMATION_PATIENT(EmailFamily.APPOINTMENT),
    APPOINTMENT_CONFIRMATION_DOCTOR(EmailFamily.APPOINTMENT),
    APPOINTMENT_CANCEL_PATIENT(EmailFamily.APPOINTMENT),
    APPOINTMENT_CANCEL_DOCTOR(EmailFamily.APPOINTMENT),
    APPOINTMENT_BOOKED_PATIENT(EmailFamily.APPOINTMENT),
    APPOINTMENT_BOOKED_DOCTOR(EmailFamily.APPOINTMENT),

    PRESCRIPTION_CREATED(EmailFamily.PRESCRIPTION),
    PRESCRIPTION_EXPIRING(EmailFamily.PRESCRIPTION),
    PRESCRIPTION_READY_FOR_PICKUP(EmailFamily.PRESCRIPTION),
    PRESCRIPTION_OUT_FOR_DELIVERY(EmailFamily.PRESCRIPTION),

    FAMILY_MEMBER_INVITE(EmailFamily.FAMILY),
    FAMILY_MEMBER_JOINED(EmailFamily.FAMILY),
    FAMILY_MEMBER_REMOVED(EmailFamily.FAMILY),

    // Billing and payment notifications
    BILL_GENERATED(EmailFamily.PAYMENT),
    PAYMENT_RECEIPT(EmailFamily.PAYMENT),

    // Referral notifications
    REFERRAL_CREATED(EmailFamily.REFERRAL);

    private final EmailFamily family;

    EmailType(EmailFamily family) {
        this.family = family;
    }

    @Override
    public String toString() {
        return this.name().toLowerCase().replace('_', ' ');
    }
}
