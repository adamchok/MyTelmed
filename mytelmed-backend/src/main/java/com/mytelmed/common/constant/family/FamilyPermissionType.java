package com.mytelmed.common.constant.family;

public enum FamilyPermissionType {
    BOOK_APPOINTMENT("Can book appointments for the patient"),
    CANCEL_APPOINTMENT("Can cancel appointments for the patient"),
    VIEW_APPOINTMENT("Can view appointment details"),
    JOIN_VIDEO_CALL("Can join video calls"),
    VIEW_DOCUMENTS("Can view patient documents"),
    ATTACH_DOCUMENTS("Can attach documents to appointments"),
    VIEW_REFERRALS("Can view patient referrals"),
    MANAGE_FAMILY_MEMBERS("Can manage other family members");

    private final String description;

    FamilyPermissionType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
} 