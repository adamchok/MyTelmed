package com.mytelmed.common.event.referral.model;

import com.mytelmed.core.referral.entity.Referral;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

/**
 * Event published when a new referral is created in the Malaysian public
 * healthcare
 * telemedicine system. This triggers the sending of referral notification
 * emails to
 * the patient and their permitted family members.
 */
@Builder
public record ReferralCreatedEvent(
    @NotNull(message = "Referral is required") Referral referral) {
}