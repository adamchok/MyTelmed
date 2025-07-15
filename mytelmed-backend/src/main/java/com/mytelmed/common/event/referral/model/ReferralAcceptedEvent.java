package com.mytelmed.common.event.referral.model;

import com.mytelmed.core.referral.entity.Referral;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

/**
 * Event published when a referral is accepted by the referred doctor in the
 * Malaysian public healthcare telemedicine system.
 * This triggers the sending of referral acceptance notification emails and push
 * notifications to the patient and their permitted family members.
 */
@Builder
public record ReferralAcceptedEvent(
        @NotNull(message = "Referral is required") Referral referral) {
}