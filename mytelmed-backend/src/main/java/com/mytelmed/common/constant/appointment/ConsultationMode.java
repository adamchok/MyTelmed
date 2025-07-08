package com.mytelmed.common.constant.appointment;

/**
 * Consultation mode for appointments in Malaysian public healthcare
 * telemedicine.
 * Determines whether the appointment is conducted physically at the facility or
 * virtually online.
 */
public enum ConsultationMode {
    /**
     * Virtual appointment conducted online via video call
     */
    VIRTUAL,

    /**
     * Physical appointment conducted at the healthcare facility
     */
    PHYSICAL
}
