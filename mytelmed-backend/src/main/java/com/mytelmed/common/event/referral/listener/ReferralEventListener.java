package com.mytelmed.common.event.referral.listener;

import com.mytelmed.common.constant.family.FamilyPermissionType;
import com.mytelmed.common.event.referral.model.ReferralCreatedEvent;
import com.mytelmed.core.family.entity.FamilyMember;
import com.mytelmed.core.family.repository.FamilyMemberRepository;
import com.mytelmed.infrastructure.email.constant.EmailType;
import com.mytelmed.infrastructure.email.factory.EmailSenderFactoryRegistry;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


/**
 * Event listener for referral-related events in Malaysian public healthcare
 * telemedicine.
 * Handles sending of referral notification emails to patients and their
 * authorized family members.
 */
@Slf4j
@Component
public class ReferralEventListener {

    private final EmailSenderFactoryRegistry emailService;
    private final FamilyMemberRepository familyMemberRepository;
    private final String frontendUrl;

    public ReferralEventListener(EmailSenderFactoryRegistry emailService,
                                 FamilyMemberRepository familyMemberRepository,
                                 @Value("${application.frontend.url}") String frontendUrl) {
        this.emailService = emailService;
        this.familyMemberRepository = familyMemberRepository;
        this.frontendUrl = frontendUrl;
    }

    /**
     * Handles referral creation events and sends notification emails to patients
     * and authorized family members
     */
    @Async
    @EventListener
    public void handleReferralCreated(ReferralCreatedEvent event) {
        log.info("Handling referral created event for referral: {}", event.referral().getReferralNumber());

        try {
            Map<String, Object> emailVariables = buildReferralCreatedEmailVariables(event);

            // Send email to patient
            String patientEmail = event.referral().getPatient().getEmail();
            sendEmailNotification(patientEmail, EmailType.REFERRAL_CREATED, emailVariables);
            log.debug("Sent referral notification to patient: {}", patientEmail);

            // Send emails to authorized family members with VIEW_REFERRALS permission
            sendNotificationsToAuthorizedFamilyMembers(event.referral().getPatient().getId(), emailVariables);

            log.info("Successfully sent referral created notifications for referral: {}",
                    event.referral().getReferralNumber());
        } catch (Exception e) {
            log.error("Error sending referral created notifications for referral: {}",
                    event.referral().getReferralNumber(), e);
        }
    }

    /**
     * Builds email variables for referral created notifications
     */
    private Map<String, Object> buildReferralCreatedEmailVariables(ReferralCreatedEvent event) {
        Map<String, Object> variables = new HashMap<>();

        // Basic referral information
        variables.put("referralId", event.referral().getId().toString());
        variables.put("referralNumber", event.referral().getReferralNumber());
        variables.put("referralType", event.referral().getReferralType().toString());
        variables.put("priority", event.referral().getPriority().toString());
        variables.put("reasonForReferral", event.referral().getReasonForReferral());
        variables.put("clinicalSummary", event.referral().getClinicalSummary());
        variables.put("expiryDate", event.referral().getExpiryDate());
        variables.put("createdAt", event.referral().getCreatedAt());

        // Patient information
        variables.put("patientName", event.referral().getPatient().getName());

        // Referring doctor information
        variables.put("referringDoctorName", "Dr. " + event.referral().getReferringDoctor().getName());

        // Optional clinical information
        if (event.referral().getCurrentMedications() != null
                && !event.referral().getCurrentMedications().trim().isEmpty()) {
            variables.put("currentMedications", event.referral().getCurrentMedications());
        }
        if (event.referral().getAllergies() != null && !event.referral().getAllergies().trim().isEmpty()) {
            variables.put("allergies", event.referral().getAllergies());
        }
        if (event.referral().getInvestigationsDone() != null
                && !event.referral().getInvestigationsDone().trim().isEmpty()) {
            variables.put("investigationsDone", event.referral().getInvestigationsDone());
        }
        if (event.referral().getNotes() != null && !event.referral().getNotes().trim().isEmpty()) {
            variables.put("notes", event.referral().getNotes());
        }

        // Type-specific information
        if (event.referral().getReferralType().toString().equals("INTERNAL")) {
            // Internal referral - referred doctor within MyTelmed system
            if (event.referral().getReferredDoctor() != null) {
                variables.put("referredDoctorName", "Dr. " + event.referral().getReferredDoctor().getName());
                // Note: We'd need to enhance Doctor entity to include speciality if needed
                // variables.put("referredDoctorSpeciality",
                // event.referral().getReferredDoctor().getSpeciality());
                // variables.put("referredFacilityName",
                // event.referral().getReferredDoctor().getFacility().getName());
            }
        } else {
            // External referral - outside MyTelmed system
            if (event.referral().getExternalDoctorName() != null) {
                variables.put("externalDoctorName", event.referral().getExternalDoctorName());
            }
            if (event.referral().getExternalDoctorSpeciality() != null) {
                variables.put("externalDoctorSpeciality", event.referral().getExternalDoctorSpeciality());
            }
            if (event.referral().getExternalFacilityName() != null) {
                variables.put("externalFacilityName", event.referral().getExternalFacilityName());
            }
            if (event.referral().getExternalFacilityAddress() != null) {
                variables.put("externalFacilityAddress", event.referral().getExternalFacilityAddress());
            }
            if (event.referral().getExternalContactNumber() != null) {
                variables.put("externalContactNumber", event.referral().getExternalContactNumber());
            }
        }

        // UI links
        variables.put("uiHost", frontendUrl);

        return variables;
    }

    /**
     * Sends referral notifications to family members with VIEW_REFERRALS permission
     */
    private void sendNotificationsToAuthorizedFamilyMembers(java.util.UUID patientId,
                                                            Map<String, Object> emailVariables) {
        try {
            // Find all family members for this patient
            List<FamilyMember> familyMembers = familyMemberRepository.findAllByPatientId(patientId);

            int sentCount = 0;
            for (FamilyMember familyMember : familyMembers) {
                // Skip pending family members
                if (familyMember.isPending()) {
                    log.debug("Skipping pending family member: {}", familyMember.getId());
                    continue;
                }

                // Check if family member has VIEW_REFERRALS permission
                boolean hasPermission = familyMember.getPermissions().stream()
                        .anyMatch(permission -> permission.getPermissionType() == FamilyPermissionType.VIEW_REFERRALS &&
                                permission.isActive());

                if (hasPermission) {
                    try {
                        String familyMemberEmail = familyMember.getEmail();
                        sendEmailNotification(familyMemberEmail, EmailType.REFERRAL_CREATED, emailVariables);
                        sentCount++;
                        log.debug("Sent referral notification to authorized family member: {}", familyMemberEmail);
                    } catch (Exception e) {
                        log.warn("Failed to send referral notification to family member {}: {}",
                                familyMember.getId(), e.getMessage());
                    }
                } else {
                    log.debug("Family member {} does not have VIEW_REFERRALS permission", familyMember.getId());
                }
            }

            log.info("Sent referral notifications to {} authorized family members", sentCount);
        } catch (Exception e) {
            log.error("Error sending referral notifications to family members for patient {}: {}",
                    patientId, e.getMessage());
        }
    }

    /**
     * Sends email notification using the email service
     */
    private void sendEmailNotification(String recipientEmail, EmailType emailType, Map<String, Object> variables) {
        try {
            emailService.getEmailSender(emailType).sendEmail(recipientEmail, variables);
        } catch (Exception e) {
            log.error("Failed to send {} email notification to: {}", emailType, recipientEmail, e);
            throw e;
        }
    }
}