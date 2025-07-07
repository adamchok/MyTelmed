package com.mytelmed.core.referral.dto;

import com.mytelmed.common.constant.referral.ReferralPriority;
import com.mytelmed.common.constant.referral.ReferralType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.util.UUID;


public record CreateReferralRequestDto(
        @NotNull(message = "Patient ID is required") UUID patientId,

        @NotNull(message = "Referral type is required") ReferralType referralType,

        // For internal referrals
        UUID referredDoctorId,

        // For external referrals
        String externalDoctorName,
        String externalDoctorSpeciality,
        String externalFacilityName,
        String externalFacilityAddress,
        String externalContactNumber,
        String externalEmail,

        @NotNull(message = "Priority is required") ReferralPriority priority,

        @NotBlank(message = "Clinical summary is required") String clinicalSummary,

        @NotBlank(message = "Reason for referral is required") String reasonForReferral,

        String investigationsDone,
        String currentMedications,
        String allergies,
        String vitalSigns,

        @NotBlank(message = "Expiry date is required")
        @Pattern(regexp = "^\\d{2}-\\d{2}-\\d{4}$", message = "Expiry date must be in the format dd-MM-yyyy")
        String expiryDate,

        String notes
) {
}