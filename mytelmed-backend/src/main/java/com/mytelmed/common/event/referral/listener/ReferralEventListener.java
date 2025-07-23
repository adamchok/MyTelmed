package com.mytelmed.common.event.referral.listener;

import com.mytelmed.common.constant.family.FamilyPermissionType;
import com.mytelmed.common.event.referral.model.ReferralCreatedEvent;
import com.mytelmed.common.event.referral.model.ReferralAcceptedEvent;
import com.mytelmed.common.event.referral.model.ReferralRejectedEvent;
import com.mytelmed.common.event.referral.model.ReferralScheduledEvent;
import com.mytelmed.core.family.entity.FamilyMember;
import com.mytelmed.core.family.repository.FamilyMemberRepository;
import com.mytelmed.core.notification.service.PushSubscriptionService;
import com.mytelmed.core.patient.entity.Patient;
import com.mytelmed.core.patient.service.PatientService;
import com.mytelmed.infrastructure.email.constant.EmailType;
import com.mytelmed.infrastructure.email.factory.EmailSenderFactoryRegistry;
import com.mytelmed.infrastructure.push.constant.PushNotificationType;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Event listener for referral-related events in Malaysian public healthcare
 * telemedicine.
 * Handles sending of referral notification emails and push notifications to
 * patients and their authorized family members.
 */
@Slf4j
@Component
public class ReferralEventListener {

    private final EmailSenderFactoryRegistry emailService;
    private final PushSubscriptionService pushSubscriptionService;
    private final FamilyMemberRepository familyMemberRepository;
    private final String frontendUrl;
    private final PatientService patientService;

    public ReferralEventListener(EmailSenderFactoryRegistry emailService,
            PushSubscriptionService pushSubscriptionService,
            FamilyMemberRepository familyMemberRepository,
            @Value("${application.frontend.url}") String frontendUrl,
            PatientService patientService) {
        this.emailService = emailService;
        this.pushSubscriptionService = pushSubscriptionService;
        this.familyMemberRepository = familyMemberRepository;
        this.frontendUrl = frontendUrl;
        this.patientService = patientService;
    }

    /**
     * Handles referral creation events and sends notification emails and push
     * notifications to patients and authorized family members
     */
    @Async
    @EventListener
    public void handleReferralCreated(ReferralCreatedEvent event) {
        log.info("Handling referral created event for referral: {}", event.referral().getReferralNumber());

        try {
            // Build specific variables for each strategy
            Map<String, Object> emailVariables = buildReferralCreatedEmailVariables(event);
            Map<String, Object> pushVariables = buildReferralCreatedPushVariables(event);

            // Send email to patient
            String patientEmail = event.referral().getPatient().getEmail();
            sendEmailNotification(patientEmail, EmailType.REFERRAL_CREATED, emailVariables);
            log.debug("Sent referral email notification to patient: {}", patientEmail);

            // Send push notification to patient
            UUID patientAccountId = event.referral().getPatient().getAccount().getId();
            sendPushNotification(patientAccountId, PushNotificationType.REFERRAL_CREATED, pushVariables);
            log.debug("Sent referral push notification to patient account: {}", patientAccountId);

            // Send notifications to authorized family members with VIEW_REFERRALS
            // permission
            sendNotificationsToAuthorizedFamilyMembers(event.referral().getPatient().getId(),
                    emailVariables, pushVariables, EmailType.REFERRAL_CREATED, PushNotificationType.REFERRAL_CREATED);

            log.info("Successfully sent referral created notifications for referral: {}",
                    event.referral().getReferralNumber());
        } catch (Exception e) {
            log.error("Error sending referral created notifications for referral: {}",
                    event.referral().getReferralNumber(), e);
        }
    }

    /**
     * Handles referral accepted events and sends notifications to patients and
     * authorized family members
     */
    @Async
    @EventListener
    public void handleReferralAccepted(ReferralAcceptedEvent event) {
        log.info("Handling referral accepted event for referral: {}", event.referral().getReferralNumber());

        try {
            // Build specific variables for each strategy
            Map<String, Object> emailVariables = buildReferralAcceptedEmailVariables(event);
            Map<String, Object> pushVariables = buildReferralAcceptedPushVariables(event);

            // Send email to patient
            String patientEmail = event.referral().getPatient().getEmail();
            sendEmailNotification(patientEmail, EmailType.REFERRAL_ACCEPTED, emailVariables);
            log.debug("Sent referral accepted email notification to patient: {}", patientEmail);

            // Send push notification to patient
            UUID patientAccountId = event.referral().getPatient().getAccount().getId();
            sendPushNotification(patientAccountId, PushNotificationType.REFERRAL_ACCEPTED, pushVariables);
            log.debug("Sent referral accepted push notification to patient account: {}", patientAccountId);

            // Send notifications to authorized family members
            sendNotificationsToAuthorizedFamilyMembers(event.referral().getPatient().getId(),
                    emailVariables, pushVariables, EmailType.REFERRAL_ACCEPTED, PushNotificationType.REFERRAL_ACCEPTED);

            log.info("Successfully sent referral accepted notifications for referral: {}",
                    event.referral().getReferralNumber());
        } catch (Exception e) {
            log.error("Error sending referral accepted notifications for referral: {}",
                    event.referral().getReferralNumber(), e);
        }
    }

    /**
     * Handles referral rejected events and sends notifications to patients and
     * authorized family members
     */
    @Async
    @EventListener
    public void handleReferralRejected(ReferralRejectedEvent event) {
        log.info("Handling referral rejected event for referral: {}", event.referral().getReferralNumber());

        try {
            // Build specific variables for each strategy
            Map<String, Object> emailVariables = buildReferralRejectedEmailVariables(event);
            Map<String, Object> pushVariables = buildReferralRejectedPushVariables(event);

            // Send email to patient
            String patientEmail = event.referral().getPatient().getEmail();
            sendEmailNotification(patientEmail, EmailType.REFERRAL_REJECTED, emailVariables);
            log.debug("Sent referral rejected email notification to patient: {}", patientEmail);

            // Send push notification to patient
            UUID patientAccountId = event.referral().getPatient().getAccount().getId();
            sendPushNotification(patientAccountId, PushNotificationType.REFERRAL_REJECTED, pushVariables);
            log.debug("Sent referral rejected push notification to patient account: {}", patientAccountId);

            // Send notifications to authorized family members
            sendNotificationsToAuthorizedFamilyMembers(event.referral().getPatient().getId(),
                    emailVariables, pushVariables, EmailType.REFERRAL_REJECTED, PushNotificationType.REFERRAL_REJECTED);

            log.info("Successfully sent referral rejected notifications for referral: {}",
                    event.referral().getReferralNumber());
        } catch (Exception e) {
            log.error("Error sending referral rejected notifications for referral: {}",
                    event.referral().getReferralNumber(), e);
        }
    }

    /**
     * Handles referral scheduled events and sends notifications to patients and
     * authorized family members
     */
    @Async
    @EventListener
    public void handleReferralScheduled(ReferralScheduledEvent event) {
        log.info("Handling referral scheduled event for referral: {}", event.referral().getReferralNumber());

        try {
            // Build specific variables for each strategy
            Map<String, Object> emailVariables = buildReferralScheduledEmailVariables(event);
            Map<String, Object> pushVariables = buildReferralScheduledPushVariables(event);

            // Send email to patient
            String patientEmail = event.referral().getPatient().getEmail();
            sendEmailNotification(patientEmail, EmailType.REFERRAL_SCHEDULED, emailVariables);
            log.debug("Sent referral scheduled email notification to patient: {}", patientEmail);

            // Send push notification to patient
            UUID patientAccountId = event.referral().getPatient().getAccount().getId();
            sendPushNotification(patientAccountId, PushNotificationType.REFERRAL_SCHEDULED, pushVariables);
            log.debug("Sent referral scheduled push notification to patient account: {}", patientAccountId);

            // Send notifications to authorized family members
            sendNotificationsToAuthorizedFamilyMembers(event.referral().getPatient().getId(),
                    emailVariables, pushVariables, EmailType.REFERRAL_SCHEDULED,
                    PushNotificationType.REFERRAL_SCHEDULED);

            log.info("Successfully sent referral scheduled notifications for referral: {}",
                    event.referral().getReferralNumber());
        } catch (Exception e) {
            log.error("Error sending referral scheduled notifications for referral: {}",
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

                // Convert List<String> to comma-separated format
                List<String> specialities = event.referral().getReferredDoctor().getSpecialityList();
                String formattedSpecialities = String.join(", ", specialities);
                variables.put("referredDoctorSpeciality", formattedSpecialities);

                variables.put("facilityName", event.referral().getReferredDoctor().getFacility().getName());
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
     * Builds push notification variables for referral created notifications
     */
    private Map<String, Object> buildReferralCreatedPushVariables(ReferralCreatedEvent event) {
        Map<String, Object> variables = new HashMap<>();

        // Basic referral information for push notifications
        variables.put("referralId", event.referral().getId().toString());
        variables.put("referralNumber", event.referral().getReferralNumber());
        variables.put("referralType", event.referral().getReferralType().toString());
        variables.put("priority", event.referral().getPriority().toString());
        variables.put("expiryDate", event.referral().getExpiryDate());

        // Doctor information
        variables.put("referringDoctorName", "Dr. " + event.referral().getReferringDoctor().getName());

        // Type-specific information for push notifications
        if (event.referral().getReferralType().toString().equals("INTERNAL")) {
            if (event.referral().getReferredDoctor() != null) {
                variables.put("referredDoctorName", "Dr. " + event.referral().getReferredDoctor().getName());
            }
        } else {
            // External referral information
            if (event.referral().getExternalDoctorName() != null) {
                variables.put("externalDoctorName", event.referral().getExternalDoctorName());
            }
            if (event.referral().getExternalFacilityName() != null) {
                variables.put("externalFacilityName", event.referral().getExternalFacilityName());
            }
        }

        return variables;
    }

    /**
     * Builds email variables for referral accepted notifications
     */
    private Map<String, Object> buildReferralAcceptedEmailVariables(ReferralAcceptedEvent event) {
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
        variables.put("acceptedAt", event.referral().getAcceptedAt());

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

                // Convert List<String> to comma-separated format
                List<String> specialities = event.referral().getReferredDoctor().getSpecialityList();
                String formattedSpecialities = String.join(", ", specialities);
                variables.put("referredDoctorSpeciality", formattedSpecialities);

                if (event.referral().getReferredDoctor().getFacility() != null) {
                    variables.put("facilityName", event.referral().getReferredDoctor().getFacility().getName());
                }
            }
        }

        // UI links
        variables.put("uiHost", frontendUrl);

        return variables;
    }

    /**
     * Builds push notification variables for referral accepted notifications
     */
    private Map<String, Object> buildReferralAcceptedPushVariables(ReferralAcceptedEvent event) {
        Map<String, Object> variables = new HashMap<>();

        variables.put("referralId", event.referral().getId().toString());
        variables.put("referralNumber", event.referral().getReferralNumber());
        variables.put("referralType", event.referral().getReferralType().toString());

        if (event.referral().getReferredDoctor() != null) {
            variables.put("referredDoctorName", "Dr. " + event.referral().getReferredDoctor().getName());
        }

        return variables;
    }

    /**
     * Builds email variables for referral rejected notifications
     */
    private Map<String, Object> buildReferralRejectedEmailVariables(ReferralRejectedEvent event) {
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
        variables.put("rejectedAt", event.referral().getRejectedAt());

        // Patient information
        variables.put("patientName", event.referral().getPatient().getName());

        // Referring doctor information
        variables.put("referringDoctorName", "Dr. " + event.referral().getReferringDoctor().getName());

        // Rejection-specific information
        if (event.referral().getRejectionReason() != null) {
            variables.put("rejectionReason", event.referral().getRejectionReason());
        }

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

                // Convert List<String> to comma-separated format
                List<String> specialities = event.referral().getReferredDoctor().getSpecialityList();
                String formattedSpecialities = String.join(", ", specialities);
                variables.put("referredDoctorSpeciality", formattedSpecialities);
            }
        }

        // UI links
        variables.put("uiHost", frontendUrl);

        return variables;
    }

    /**
     * Builds push notification variables for referral rejected notifications
     */
    private Map<String, Object> buildReferralRejectedPushVariables(ReferralRejectedEvent event) {
        Map<String, Object> variables = new HashMap<>();

        variables.put("referralId", event.referral().getId().toString());
        variables.put("referralNumber", event.referral().getReferralNumber());
        variables.put("referralType", event.referral().getReferralType().toString());

        if (event.referral().getReferredDoctor() != null) {
            variables.put("referredDoctorName", "Dr. " + event.referral().getReferredDoctor().getName());
        }

        if (event.referral().getRejectionReason() != null) {
            variables.put("rejectionReason", event.referral().getRejectionReason());
        }

        return variables;
    }

    /**
     * Builds push notification variables for referral scheduled notifications
     */
    private Map<String, Object> buildReferralScheduledPushVariables(ReferralScheduledEvent event) {
        Map<String, Object> variables = new HashMap<>();

        variables.put("referralId", event.referral().getId().toString());
        variables.put("referralNumber", event.referral().getReferralNumber());
        variables.put("appointmentId", event.appointment().getId().toString());
        variables.put("appointmentDateTime", event.appointment().getTimeSlot().getStartTime());
        variables.put("consultationMode", event.appointment().getConsultationMode().toString());

        if (event.referral().getReferredDoctor() != null) {
            variables.put("referredDoctorName", "Dr. " + event.referral().getReferredDoctor().getName());
            if (event.referral().getReferredDoctor().getFacility() != null) {
                variables.put("facilityName", event.referral().getReferredDoctor().getFacility().getName());
            }
        }

        return variables;
    }

    /**
     * Builds email variables for referral scheduled notifications
     */
    private Map<String, Object> buildReferralScheduledEmailVariables(ReferralScheduledEvent event) {
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

        // Appointment-specific information
        variables.put("appointmentId", event.appointment().getId().toString());
        variables.put("appointmentDateTime", event.appointment().getTimeSlot().getStartTime());
        variables.put("consultationMode", event.appointment().getConsultationMode().toString());

        // Patient information
        variables.put("patientName", event.referral().getPatient().getName());

        // Referring doctor information
        variables.put("referringDoctorName", "Dr. " + event.referral().getReferringDoctor().getName());

        // Facility information
        if (event.referral().getReferredDoctor() != null
                && event.referral().getReferredDoctor().getFacility() != null) {
            variables.put("facilityName", event.referral().getReferredDoctor().getFacility().getName());
            if (event.referral().getReferredDoctor().getFacility().getAddress() != null) {
                variables.put("facilityAddress", event.referral().getReferredDoctor().getFacility().getAddress());
            }
        }

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

                // Convert List<String> to comma-separated format
                List<String> specialities = event.referral().getReferredDoctor().getSpecialityList();
                String formattedSpecialities = String.join(", ", specialities);
                variables.put("referredDoctorSpeciality", formattedSpecialities);
            }
        }

        // UI links
        variables.put("uiHost", frontendUrl);

        return variables;
    }

    /**
     * Sends referral notifications to family members with VIEW_REFERRALS permission
     */
    private void sendNotificationsToAuthorizedFamilyMembers(UUID patientId,
            Map<String, Object> emailVariables,
            Map<String, Object> pushVariables) {
        try {
            // Find all family members for this patient
            List<FamilyMember> familyMembers = familyMemberRepository.findAllByPatientId(patientId);

            int emailsSent = 0;
            int pushNotificationsSent = 0;

            for (FamilyMember familyMember : familyMembers) {
                // Skip pending family members
                if (familyMember.isPending() || familyMember.getMemberAccount() == null) {
                    log.debug("Skipping pending family member: {}", familyMember.getId());
                    continue;
                }

                // Get family member email and account ID
                String familyMemberEmail;
                UUID familyMemberAccountId;
                try {
                    Patient familyMemberPatient = patientService
                            .findPatientByAccountId(familyMember.getMemberAccount().getId());
                    familyMemberEmail = familyMemberPatient.getEmail();
                    familyMemberAccountId = familyMember.getMemberAccount().getId();
                } catch (Exception e) {
                    log.warn("Failed to find patient for family member {}: {}", familyMember.getId(), e.getMessage());
                    continue;
                }

                // Check if the family member has VIEW_REFERRALS permission
                // Since we moved to individual permission fields, check canViewMedicalRecords
                // for referral access
                boolean hasPermission = familyMember.isCanViewMedicalRecords();

                if (hasPermission) {
                    try {
                        // Send email notification
                        sendEmailNotification(familyMemberEmail, EmailType.REFERRAL_CREATED, emailVariables);
                        emailsSent++;
                        log.debug("Sent referral email notification to authorized family member: {}",
                                familyMemberEmail);

                        // Send push notification
                        sendPushNotification(familyMemberAccountId, PushNotificationType.REFERRAL_CREATED,
                                pushVariables);
                        pushNotificationsSent++;
                        log.debug("Sent referral push notification to authorized family member account: {}",
                                familyMemberAccountId);

                    } catch (Exception e) {
                        log.warn("Failed to send referral notification to family member {}: {}",
                                familyMember.getId(), e.getMessage());
                    }
                } else {
                    log.debug("Family member {} does not have VIEW_REFERRALS permission", familyMember.getId());
                }
            }

            log.info("Sent referral notifications to {} authorized family members (emails: {}, push: {})",
                    familyMembers.size(), emailsSent, pushNotificationsSent);
        } catch (Exception e) {
            log.error("Error sending referral notifications to family members for patient {}: {}", patientId,
                    e.getMessage());
        }
    }

    /**
     * Sends referral notifications to family members with VIEW_REFERRALS permission
     */
    private void sendNotificationsToAuthorizedFamilyMembers(UUID patientId,
            Map<String, Object> emailVariables,
            Map<String, Object> pushVariables,
            EmailType emailType,
            PushNotificationType notificationType) {
        try {
            // Find all family members for this patient
            List<FamilyMember> familyMembers = familyMemberRepository.findAllByPatientId(patientId);

            int emailsSent = 0;
            int pushNotificationsSent = 0;

            for (FamilyMember familyMember : familyMembers) {
                // Skip pending family members
                if (familyMember.isPending() || familyMember.getMemberAccount() == null) {
                    log.debug("Skipping pending family member: {}", familyMember.getId());
                    continue;
                }

                // Get family member email and account ID
                String familyMemberEmail;
                UUID familyMemberAccountId;
                try {
                    Patient familyMemberPatient = patientService
                            .findPatientByAccountId(familyMember.getMemberAccount().getId());
                    familyMemberEmail = familyMemberPatient.getEmail();
                    familyMemberAccountId = familyMember.getMemberAccount().getId();
                } catch (Exception e) {
                    log.warn("Failed to find patient for family member {}: {}", familyMember.getId(), e.getMessage());
                    continue;
                }

                // Check if the family member has VIEW_REFERRALS permission
                // Since we moved to individual permission fields, check canViewMedicalRecords
                // for referral access
                boolean hasPermission = familyMember.isCanViewMedicalRecords();

                if (hasPermission) {
                    try {
                        // Send email notification
                        sendEmailNotification(familyMemberEmail, emailType, emailVariables);
                        emailsSent++;
                        log.debug("Sent referral email notification to authorized family member: {}",
                                familyMemberEmail);

                        // Send push notification
                        sendPushNotification(familyMemberAccountId, notificationType, pushVariables);
                        pushNotificationsSent++;
                        log.debug("Sent referral push notification to authorized family member account: {}",
                                familyMemberAccountId);

                    } catch (Exception e) {
                        log.warn("Failed to send referral notification to family member {}: {}",
                                familyMember.getId(), e.getMessage());
                    }
                } else {
                    log.debug("Family member {} does not have VIEW_REFERRALS permission", familyMember.getId());
                }
            }

            log.info("Sent referral notifications to {} authorized family members (emails: {}, push: {})",
                    familyMembers.size(), emailsSent, pushNotificationsSent);
        } catch (Exception e) {
            log.error("Error sending referral notifications to family members for patient {}: {}", patientId,
                    e.getMessage());
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

    /**
     * Sends push notification using the push subscription service
     */
    private void sendPushNotification(UUID accountId, PushNotificationType notificationType,
            Map<String, Object> variables) {
        try {
            if (accountId == null) {
                log.warn("Cannot send push notification: account ID is null for type: {}", notificationType);
                return;
            }

            log.debug("Sending push notification to account {} for type: {}", accountId, notificationType);
            pushSubscriptionService.sendNotificationByAccountId(accountId, notificationType, variables);

        } catch (Exception e) {
            log.warn("Failed to send push notification to account {}: {}", accountId, e.getMessage());
        }
    }
}