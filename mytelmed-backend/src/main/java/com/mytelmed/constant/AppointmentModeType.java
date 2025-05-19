package com.mytelmed.constant;

public enum AppointmentModeType {
    IN_PERSON,
    VIDEO_CALL;

    public String toShortName() {
        return switch (this) {
            case IN_PERSON -> "phy";
            case VIDEO_CALL -> "vid";
        };
    }

    public static AppointmentModeType fromShortName(String shortName) {
        return switch (shortName) {
            case "phy" -> IN_PERSON;
            case "vid" -> VIDEO_CALL;
            default -> throw new IllegalArgumentException("Unknown AppointmentModeType short name: " + shortName);
        };
    }
}