package com.mytelmed.constant;

public enum GenderType {
    MALE,
    FEMALE;

    public char toChar() {
        return this == MALE ? 'm' : 'f';
    }

    public static GenderType fromChar(char code) {
        return switch(code) {
            case 'm' -> GenderType.MALE;
            case 'f' -> GenderType.FEMALE;
            default -> throw new IllegalArgumentException("Unknown GenderType code: " + code);
        };
    }
}
