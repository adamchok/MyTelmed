package com.mytelmed.constant;

public enum EntityType {
    FACILITY,
    DOCTOR,
    ARTICLE,
    DEPARTMENT,
    PATIENT;

    public String toShortName() {
        switch (this) {
            case FACILITY -> {
                return "fac";
            }
            case DOCTOR -> {
                return "doc";
            }
            case ARTICLE -> {
                return "art";
            }
            case DEPARTMENT -> {
                return "dep";
            }
            case PATIENT -> {
                return "pat";
            }
            default -> throw new IllegalArgumentException("Unknown entity type");
        }
    }

    public static EntityType fromShortName(String shortName) {
        return switch (shortName) {
            case "fac" -> FACILITY;
            case "doc" -> DOCTOR;
            case "art" -> ARTICLE;
            case "dep" -> DEPARTMENT;
            case "pat" -> PATIENT;
            default -> throw new IllegalArgumentException("Unknown entity type short name: " + shortName);
        };
    }

}
