package com.mytelmed.constant;

public enum EntityType {
    FACILITY,
    DOCTOR,
    ARTICLE,
    PATIENT;

    public char toChar() {
        switch (this) {
            case FACILITY -> {
                return 'f';
            }
            case DOCTOR -> {
                return 'd';
            }
            case ARTICLE -> {
                return 'a';
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
            case 'a' -> ARTICLE;
            case 'p' -> PATIENT;
            default -> throw new IllegalArgumentException("Unknown entity type code: " + code);
        };
    }

}
