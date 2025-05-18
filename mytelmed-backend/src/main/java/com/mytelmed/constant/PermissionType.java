package com.mytelmed.constant;

public enum PermissionType {
    ADMIN,
    DOCTOR,
    PATIENT,
    PHARMACIST;

    public String toShortName() {
        switch (this) {
            case ADMIN -> {
                return "adm";
            }
            case DOCTOR -> {
                return "doc";
            }
            case PATIENT -> {
                return "pat";
            }
            case PHARMACIST -> {
                return "phar";
            }
            default -> throw new IllegalArgumentException("Unknown permission type");
        }
    }

    public static PermissionType fromShortName(String shortName) {
        return switch (shortName) {
            case "adm" -> ADMIN;
            case "doc" -> DOCTOR;
            case "pat" -> PATIENT;
            case "phar" -> PHARMACIST;
            default -> throw new IllegalArgumentException("Unknown permission type code: " + shortName);
        };
    }
}
