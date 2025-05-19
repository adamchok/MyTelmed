package com.mytelmed.constant;

public enum SpecializationType {
    CARDIOLOGY,
    DERMATOLOGY,
    ENDOCRINOLOGY,
    GASTROENTEROLOGY,
    NEUROLOGY,
    ONCOLOGY,
    OPHTHALMOLOGY,
    ORTHOPEDICS,
    PEDIATRICS,
    PSYCHIATRY,
    RADIOLOGY,
    RESPIRATORY_MEDICINE,
    SURGERY,
    UROLOGY;

    public String toShortName() {
        return switch (this) {
            case CARDIOLOGY -> "car";
            case DERMATOLOGY -> "der";
            case ENDOCRINOLOGY -> "end";
            case GASTROENTEROLOGY -> "gas";
            case NEUROLOGY -> "neu";
            case ONCOLOGY -> "onc";
            case OPHTHALMOLOGY -> "oph";
            case ORTHOPEDICS -> "ort";
            case PEDIATRICS -> "ped";
            case PSYCHIATRY -> "psy";
            case RADIOLOGY -> "rad";
            case RESPIRATORY_MEDICINE -> "res";
            case SURGERY -> "sur";
            case UROLOGY -> "uro";
        };
    }

    public static SpecializationType fromShortName(String shortName) {
        return switch (shortName) {
            case "car" -> CARDIOLOGY;
            case "der" -> DERMATOLOGY;
            case "end" -> ENDOCRINOLOGY;
            case "gas" -> GASTROENTEROLOGY;
            case "neu" -> NEUROLOGY;
            case "onc" -> ONCOLOGY;
            case "oph" -> OPHTHALMOLOGY;
            case "ort" -> ORTHOPEDICS;
            case "ped" -> PEDIATRICS;
            case "psy" -> PSYCHIATRY;
            case "rad" -> RADIOLOGY;
            case "res" -> RESPIRATORY_MEDICINE;
            case "sur" -> SURGERY;
            case "uro" -> UROLOGY;
            default -> throw new IllegalArgumentException("Unknown SpecializationType short name: " + shortName);
        };
    }
}
