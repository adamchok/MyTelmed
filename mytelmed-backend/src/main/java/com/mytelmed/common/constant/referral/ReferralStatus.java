package com.mytelmed.common.constant.referral;

public enum ReferralStatus {
  PENDING, // Referral created, waiting for action
  ACCEPTED, // Referred doctor accepted the referral
  REJECTED, // Referred doctor rejected the referral
  SCHEDULED, // Appointment scheduled with referred doctor
  COMPLETED, // Referral completed (appointment done)
  EXPIRED, // Referral expired (not acted upon in time)
  CANCELLED // Referral cancelled by referring doctor or patient
}