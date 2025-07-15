package com.mytelmed.common.event.referral.model;

import com.mytelmed.core.appointment.entity.Appointment;
import com.mytelmed.core.referral.entity.Referral;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

/**
 * Event published when an appointment is scheduled for a referral in the
 * Malaysian public healthcare telemedicine system.
 * This triggers the sending of referral scheduling notification emails and push
 * notifications to the patient and their permitted family members.
 */
@Builder
public record ReferralScheduledEvent(
        @NotNull(message = "Referral is required") Referral referral,
        @NotNull(message = "Appointment is required") Appointment appointment) {
}