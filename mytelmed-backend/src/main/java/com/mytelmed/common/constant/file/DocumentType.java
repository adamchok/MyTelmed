package com.mytelmed.common.constant.file;

import com.mytelmed.common.advice.exception.InvalidInputException;
import lombok.extern.slf4j.Slf4j;


@Slf4j
public enum DocumentType {
    PRESCRIPTION,
    LAB_REPORT,
    RADIOLOGY_REPORT,
    DISCHARGE_SUMMARY,
    OPERATIVE_REPORT,
    CONSULTATION_NOTE,
    PROGRESS_NOTE,
    PATHOLOGY_REPORT,
    IMMUNIZATION_RECORD,
    REFERRAL_LETTER,
    MEDICAL_CERTIFICATE,
    HISTORY_AND_PHYSICAL,
    EMERGENCY_ROOM_REPORT,
    ANESTHESIA_RECORD,
    INPATIENT_SUMMARY,
    OUTPATIENT_SUMMARY,
    NURSING_NOTE,
    MENTAL_HEALTH_NOTE,
    MEDICAL_IMAGING,
    CLINICAL_TRIAL_DOCUMENT,
    TREATMENT_PLAN,
    DIAGNOSTIC_REPORT,
    VITAL_SIGNS_RECORD,
    ALLERGY_RECORD,
    OTHER;

    public static DocumentType fromString(String documentTypeStr) throws InvalidInputException {
        log.debug("Parsing DocumentType: {}", documentTypeStr);

        if (documentTypeStr == null || documentTypeStr.isEmpty()) {
            log.warn("Invalid DocumentType: {}", documentTypeStr);
            throw new InvalidInputException("DocumentType cannot be null or empty");
        }

        String normalizedType = documentTypeStr.toUpperCase()
                .replace('-', '_')
                .replace(' ', '_');

        try {
            DocumentType result = DocumentType.valueOf(normalizedType);
            log.debug("Parsed DocumentType: {}", normalizedType);
            return result;
        } catch (IllegalArgumentException e) {
            log.warn("Invalid DocumentType: {}", documentTypeStr);
            throw new InvalidInputException("Invalid DocumentType: " + documentTypeStr);
        }
    }
}
