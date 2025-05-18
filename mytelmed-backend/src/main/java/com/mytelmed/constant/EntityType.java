package com.mytelmed.constant;

public enum EntityType {
    FACILITY,
    DOCTOR,
    PATIENT;

    public char toChar() {
        switch (this) {
            case FACILITY -> {
                return 'f';
            }
            case DOCTOR -> {
                return 'd';
            }
            case PATIENT -> {
                return 'p';
            }
            default -> throw new IllegalArgumentException("Unknown entity type");
        }
    }

    public static EntityType fromChar(char code) {
        return switch (code) {
            case 'f' -> FACILITY;
            case 'd' -> DOCTOR;
            case 'p' -> PATIENT;
            default -> throw new IllegalArgumentException("Unknown entity type code: " + code);
        };
    }

}
