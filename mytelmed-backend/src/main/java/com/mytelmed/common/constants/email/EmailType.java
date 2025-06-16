package com.mytelmed.common.constants.email;

import lombok.Getter;


@Getter
public enum EmailType {
    PASSWORD_RESET(EmailFamily.ACCOUNT),
    EMAIL_RESET(EmailFamily.ACCOUNT),
    VERIFICATION(EmailFamily.ACCOUNT),
    ACCOUNT_ACTIVATION(EmailFamily.ACCOUNT),
    ACCOUNT_DEACTIVATION(EmailFamily.ACCOUNT),
    APPOINTMENT_REMINDER(EmailFamily.APPOINTMENT),
    APPOINTMENT_CONFIRMATION(EmailFamily.APPOINTMENT),
    APPOINTMENT_RESCHEDULE(EmailFamily.APPOINTMENT),
    APPOINTMENT_CANCEL(EmailFamily.APPOINTMENT),
    FAMILY_INVITATION(EmailFamily.FAMILY),
    FAMILY_JOINED(EmailFamily.FAMILY),
    FAMILY_REMOVAL(EmailFamily.FAMILY);

    private final EmailFamily family;

    EmailType(EmailFamily family) {
        this.family = family;
    }

    @Override
    public String toString() {
        return this.name().toLowerCase().replace('_', ' ');
    }
}
