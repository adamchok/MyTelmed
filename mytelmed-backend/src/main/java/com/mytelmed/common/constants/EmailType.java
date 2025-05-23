package com.mytelmed.common.constants;

public enum EmailType {
    PASSWORD_RESET,
    EMAIL_RESET,
    VERIFICATION,
    FAMILY_INVITATION,
    FAMILY_CONFIRMATION,
    FAMILY_REMOVAL;

    @Override
    public String toString() {
        return this.name().toLowerCase().replace('_', ' ');
    }
}
