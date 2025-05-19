package com.mytelmed.constant;

public enum PermissionType {
    ADMIN,
    DOCTOR,
    PATIENT,
    PHARMACIST;

    public String toShortName() {
        return switch (this) {
            case ADMIN -> "adm";
            case DOCTOR -> "doc";
            case PATIENT -> "pat";
            case PHARMACIST -> "phar";
        };
    }

    public static PermissionType fromShortName(String shortName) {
        return switch (shortName) {
            case "adm" -> ADMIN;
            case "doc" -> DOCTOR;
            case "pat" -> PATIENT;
            case "phar" -> PHARMACIST;
            default -> throw new IllegalArgumentException("Unknown PermissionType code: " + shortName);
        };
    }
}
