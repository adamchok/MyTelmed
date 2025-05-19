package com.mytelmed.constant;

public enum EntityType {
    FACILITY,
    DOCTOR,
    ARTICLE,
    DEPARTMENT,
    PATIENT,
    FILE;

    public String toShortName() {
        return switch (this) {
            case FACILITY -> "fac";
            case DOCTOR -> "doc";
            case ARTICLE -> "art";
            case DEPARTMENT -> "dep";
            case PATIENT -> "pat";
            case FILE -> "fil";
        };
    }

    public static EntityType fromShortName(String shortName) {
        return switch (shortName) {
            case "fac" -> FACILITY;
            case "doc" -> DOCTOR;
            case "art" -> ARTICLE;
            case "dep" -> DEPARTMENT;
            case "pat" -> PATIENT;
            case "fil" -> FILE;
            default -> throw new IllegalArgumentException("Unknown EntityType short name: " + shortName);
        };
    }

}
