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
        switch (this) {
            case CARDIOLOGY -> {
                return "car";
            }
            case DERMATOLOGY -> {
                return "der";
            }
            case ENDOCRINOLOGY -> {
                return "end";
            }
            case GASTROENTEROLOGY -> {
                return "gas";
            }
            case NEUROLOGY -> {
                return "neu";
            }
            case ONCOLOGY -> {
                return "onc";
            }
            case OPHTHALMOLOGY -> {
                return "oph";
            }
            case ORTHOPEDICS -> {
                return "ort";
            }
            case PEDIATRICS -> {
                return "ped";
            }
            case PSYCHIATRY -> {
                return "psy";
            }
            case RADIOLOGY -> {
                return "rad";
            }
            case RESPIRATORY_MEDICINE -> {
                return "res";
            }
            case SURGERY -> {
                return "sur";
            }
            case UROLOGY -> {
                return "uro";
            }
            default -> throw new IllegalArgumentException("Unknown specialization type");
        }
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
            default -> throw new IllegalArgumentException("Unknown specialization type short name: " + shortName);
        };
    }
}
