package com.mytelmed.constant;

public enum FacilityType {
    HOSPITAL,
    CLINIC;

    public char toChar() {
        return switch (this) {
            case HOSPITAL -> 'h';
            case CLINIC -> 'c';
        };
    }

    public static FacilityType fromChar(char code) {
        return switch (code) {
            case 'h' -> HOSPITAL;
            case 'c' -> CLINIC;
            default -> throw new IllegalArgumentException("Unknown FacilityType code: " + code);
        };
    }
}
