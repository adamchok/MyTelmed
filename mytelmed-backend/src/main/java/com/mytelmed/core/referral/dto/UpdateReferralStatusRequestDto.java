package com.mytelmed.core.referral.dto;

import com.mytelmed.common.constant.referral.ReferralStatus;
import jakarta.validation.constraints.NotNull;


public record UpdateReferralStatusRequestDto(
        @NotNull(message = "Status is required") ReferralStatus status,

        String rejectionReason,
        
        String notes
) {
}