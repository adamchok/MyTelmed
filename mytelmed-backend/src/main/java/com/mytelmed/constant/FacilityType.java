package com.mytelmed.constant;

public enum FacilityType {
    HOSPITAL,
    CLINIC;

    public char toChar() {
        switch (this) {
            case HOSPITAL -> {
                return 'h';
            }
            case CLINIC -> {
                return 'c';
            }
            default -> throw new IllegalArgumentException("Unknown facility type");
        }
    }

    public static FacilityType fromChar(char code) {
        return switch (code) {
            case 'h' -> HOSPITAL;
            case 'c' -> CLINIC;
            default -> throw new IllegalArgumentException("Unknown facility type code: " + code);
        };
    }
}
