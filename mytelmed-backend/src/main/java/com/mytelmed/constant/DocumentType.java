package com.mytelmed.constant;

public enum DocumentType {
    PRESCRIPTION,
    IMAGING,
    LAB_REPORT,
    DISCHARGE_SUMMARY,
    MEDICAL_HISTORY,
    CONSULTATION_NOTE,
    REFERRAL_LETTER,
    VACCINATION_RECORD,
    BILLING_DOCUMENT,
    CONSENT_FORM,
    SURGICAL_REPORT,
    PATHOLOGY_REPORT,
    ECG_REPORT,
    OTHER;

    public String toShortName() {
        return switch (this) {
            case PRESCRIPTION -> "RX";
            case IMAGING -> "IMG";
            case LAB_REPORT -> "LAB";
            case DISCHARGE_SUMMARY -> "DS";
            case MEDICAL_HISTORY -> "MH";
            case CONSULTATION_NOTE -> "CN";
            case REFERRAL_LETTER -> "RL";
            case VACCINATION_RECORD -> "VR";
            case BILLING_DOCUMENT -> "BD";
            case CONSENT_FORM -> "CF";
            case SURGICAL_REPORT -> "SR";
            case PATHOLOGY_REPORT -> "PR";
            case ECG_REPORT -> "ECG";
            case OTHER -> "OTH";
        };
    }

    public static DocumentType fromShortName(String shortName) {
        return switch (shortName.toUpperCase()) {
            case "RX" -> PRESCRIPTION;
            case "IMG" -> IMAGING;
            case "LAB" -> LAB_REPORT;
            case "DS" -> DISCHARGE_SUMMARY;
            case "MH" -> MEDICAL_HISTORY;
            case "CN" -> CONSULTATION_NOTE;
            case "RL" -> REFERRAL_LETTER;
            case "VR" -> VACCINATION_RECORD;
            case "BD" -> BILLING_DOCUMENT;
            case "CF" -> CONSENT_FORM;
            case "SR" -> SURGICAL_REPORT;
            case "PR" -> PATHOLOGY_REPORT;
            case "ECG" -> ECG_REPORT;
            case "OTH" -> OTHER;
            default -> throw new IllegalArgumentException("Unknown DocumentType short name: " + shortName);
        };
    }
}
