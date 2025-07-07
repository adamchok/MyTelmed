package com.mytelmed.core.referral.dto;

import com.mytelmed.common.constant.referral.ReferralPriority;
import com.mytelmed.common.constant.referral.ReferralStatus;
import com.mytelmed.common.constant.referral.ReferralType;
import com.mytelmed.core.appointment.dto.AppointmentDto;
import com.mytelmed.core.doctor.dto.DoctorDto;
import com.mytelmed.core.patient.dto.PatientDto;
import java.time.Instant;
import java.time.LocalDate;


public record ReferralDto(
        String id,
        String referralNumber,
        PatientDto patient,
        DoctorDto referringDoctor,
        DoctorDto referredDoctor,
        ReferralType referralType,
        ReferralStatus status,
        ReferralPriority priority,
        String clinicalSummary,
        String reasonForReferral,
        String investigationsDone,
        String currentMedications,
        String allergies,
        String vitalSigns,

        // External doctor details
        String externalDoctorName,
        String externalDoctorSpeciality,
        String externalFacilityName,
        String externalFacilityAddress,
        String externalContactNumber,
        String externalEmail,

        // Appointment details
        AppointmentDto scheduledAppointment,

        // Status timestamps
        Instant acceptedAt,
        Instant rejectedAt,
        String rejectionReason,
        Instant completedAt,

        LocalDate expiryDate,
        String notes,
        Instant createdAt,
        Instant updatedAt
) {
}
