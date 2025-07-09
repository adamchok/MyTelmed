package com.mytelmed.common.constant.prescription;

/**
 * Medical prescription status focusing on prescription lifecycle in Malaysian
 * public healthcare.
 * Delivery-related statuses are handled separately in DeliveryStatus enum.
 */
public enum PrescriptionStatus {
    /**
     * Prescription created by doctor, awaiting patient decision on delivery method
     */
    CREATED,

    /**
     * Patient has chosen delivery method, prescription ready for pharmacy
     * processing
     */
    READY_FOR_PROCESSING,

    /**
     * Pharmacist is processing/preparing the medication
     */
    PROCESSING,

    /**
     * Prescription completed - medication ready for pickup or handed to delivery
     * service
     */
    READY,

    /**
     * Prescription expired before fulfillment
     */
    EXPIRED,

    /**
     * Prescription cancelled by doctor or patient
     */
    CANCELLED
}
