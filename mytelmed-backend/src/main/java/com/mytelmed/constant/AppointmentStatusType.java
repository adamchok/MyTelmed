package com.mytelmed.constant;

public enum AppointmentStatusType {
    SCHEDULED,
    COMPLETED,
    CANCELLED,
    RESCHEDULED,
    NO_SHOW;

    public String toShortName() {
        return switch (this) {
            case SCHEDULED -> "sch";
            case COMPLETED -> "com";
            case CANCELLED -> "cal";
            case RESCHEDULED -> "res";
            case NO_SHOW -> "nos";
        };
    }

    public static AppointmentStatusType fromShortName(String shortName) {
        return switch (shortName) {
            case "sch" -> SCHEDULED;
            case "com" -> COMPLETED;
            case "cal" -> CANCELLED;
            case "res" -> RESCHEDULED;
            case "nos" -> NO_SHOW;
            default -> throw new IllegalArgumentException("Unknown AppointmentStatusType short name: " + shortName);
        };
    }
}