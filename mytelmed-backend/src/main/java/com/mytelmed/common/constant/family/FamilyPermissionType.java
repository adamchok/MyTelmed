package com.mytelmed.common.constant.family;

import lombok.Getter;


@Getter
public enum FamilyPermissionType {
    VIEW_MEDICAL_RECORDS("Can view patient medical records"),
    VIEW_APPOINTMENTS("Can view patient appointments"),
    MANAGE_APPOINTMENTS("Can book and manage patient appointments"),
    VIEW_PRESCRIPTIONS("Can view patient prescriptions"),
    MANAGE_PRESCRIPTIONS("Can manage patient prescriptions"),
    VIEW_BILLING("Can view patient billing information"),
    MANAGE_BILLING("Can manage patient billing and payments"),
    VIEW_REFERRALS("Can view patient referrals"),
    JOIN_VIDEO_CALL("Can join video calls");

    private final String description;

    FamilyPermissionType(String description) {
        this.description = description;
    }
}
