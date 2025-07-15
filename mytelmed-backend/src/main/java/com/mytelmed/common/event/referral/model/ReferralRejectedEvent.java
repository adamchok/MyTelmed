package com.mytelmed.common.event.referral.model;

import com.mytelmed.core.referral.entity.Referral;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

/**
 * Event published when a referral is rejected by the referred doctor in the
 * Malaysian public healthcare telemedicine system.
 * This triggers the sending of referral rejection notification emails and push
 * notifications to the patient and their permitted family members.
 */
@Builder
public record ReferralRejectedEvent(
        @NotNull(message = "Referral is required") Referral referral) {
}