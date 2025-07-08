package com.mytelmed.core.referral.service;

import com.mytelmed.common.advice.AppException;
import com.mytelmed.common.advice.exception.InvalidInputException;
import com.mytelmed.common.advice.exception.ResourceNotFoundException;
import com.mytelmed.common.constant.appointment.AppointmentStatus;
import com.mytelmed.common.constant.family.FamilyPermissionType;
import com.mytelmed.common.constant.referral.ReferralStatus;
import com.mytelmed.common.constant.referral.ReferralType;
import com.mytelmed.common.event.referral.model.ReferralCreatedEvent;
import com.mytelmed.common.utils.DateTimeUtil;
import com.mytelmed.core.appointment.entity.Appointment;
import com.mytelmed.core.appointment.repository.AppointmentRepository;
import com.mytelmed.core.appointment.service.AppointmentService;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.doctor.entity.Doctor;
import com.mytelmed.core.doctor.service.DoctorService;
import com.mytelmed.core.family.service.FamilyMemberPermissionService;
import com.mytelmed.core.patient.entity.Patient;
import com.mytelmed.core.patient.service.PatientService;
import com.mytelmed.core.referral.dto.CreateReferralRequestDto;
import com.mytelmed.core.referral.dto.ReferralStatisticsDto;
import com.mytelmed.core.referral.dto.UpdateReferralStatusRequestDto;
import com.mytelmed.core.referral.entity.Referral;
import com.mytelmed.core.referral.repository.ReferralRepository;
import com.mytelmed.core.timeslot.entity.TimeSlot;
import com.mytelmed.core.timeslot.service.TimeSlotService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;


@Slf4j
@Service
public class ReferralService {
    private final ReferralRepository referralRepository;
    private final PatientService patientService;
    private final DoctorService doctorService;
    private final AppointmentRepository appointmentRepository;
    private final TimeSlotService timeSlotService;
    private final FamilyMemberPermissionService familyPermissionService;
    private final ApplicationEventPublisher eventPublisher;

    public ReferralService(ReferralRepository referralRepository,
                           PatientService patientService,
                           DoctorService doctorService,
                           AppointmentService appointmentService,
                           AppointmentRepository appointmentRepository,
                           TimeSlotService timeSlotService,
                           FamilyMemberPermissionService familyPermissionService,
                           ApplicationEventPublisher eventPublisher) {
        this.referralRepository = referralRepository;
        this.patientService = patientService;
        this.doctorService = doctorService;
        this.appointmentRepository = appointmentRepository;
        this.timeSlotService = timeSlotService;
        this.familyPermissionService = familyPermissionService;
        this.eventPublisher = eventPublisher;
    }

    @Transactional(readOnly = true)
    public Referral findById(UUID referralId) throws AppException {
        log.debug("Finding referral with ID: {}", referralId);

        Referral referral = referralRepository.findById(referralId)
                .orElseThrow(() -> {
                    log.warn("Referral not found with ID: {}", referralId);
                    return new ResourceNotFoundException("Referral not found");
                });

        log.debug("Found referral with ID: {}", referralId);
        return referral;
    }

    @Transactional(readOnly = true)
    public Referral findByReferralNumber(String referralNumber) throws AppException {
        log.debug("Finding referral with number: {}", referralNumber);

        Referral referral = referralRepository.findByReferralNumber(referralNumber)
                .orElseThrow(() -> {
                    log.warn("Referral not found with number: {}", referralNumber);
                    return new ResourceNotFoundException("Referral not found");
                });

        log.debug("Found referral with number: {}", referralNumber);
        return referral;
    }

    @Transactional(readOnly = true)
    public Page<Referral> findByPatientId(UUID patientId, Account requestingAccount, Pageable pageable)
            throws AppException {
        log.debug("Finding referrals for patient: {} by account: {}", patientId, requestingAccount.getId());

        // Verify account is authorized to view referrals for this patient
        if (!familyPermissionService.isAuthorizedForPatient(requestingAccount, patientId,
                FamilyPermissionType.VIEW_REFERRALS)) {
            throw new AppException("Insufficient permissions to view referrals for this patient");
        }

        Patient patient = patientService.findPatientById(patientId);
        return referralRepository.findByPatientOrderByCreatedAtDesc(patient, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Referral> findByReferringDoctor(Account doctorAccount, Pageable pageable) throws AppException {
        log.debug("Finding referrals by referring doctor: {}", doctorAccount.getId());

        Doctor doctor = doctorService.findByAccount(doctorAccount);
        return referralRepository.findByReferringDoctorOrderByCreatedAtDesc(doctor, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Referral> findByReferredDoctor(Account doctorAccount, Pageable pageable) throws AppException {
        log.debug("Finding referrals by referred doctor: {}", doctorAccount.getId());

        Doctor doctor = doctorService.findByAccount(doctorAccount);
        return referralRepository.findByReferredDoctorOrderByCreatedAtDesc(doctor, pageable);
    }

    @Transactional(readOnly = true)
    public List<Referral> findPendingReferralsForDoctor(Account doctorAccount) throws AppException {
        log.debug("Finding pending referrals for doctor: {}", doctorAccount.getId());

        Doctor doctor = doctorService.findByAccount(doctorAccount);
        return referralRepository.findPendingReferralsForDoctor(doctor);
    }

    @Transactional
    public void createReferral(Account doctorAccount, CreateReferralRequestDto request) throws AppException {
        log.info("Creating referral for patient: {} by doctor: {}", request.patientId(), doctorAccount.getId());

        // Validate and get patient
        Patient patient = patientService.findPatientById(request.patientId());

        // Get referring doctor
        Doctor referringDoctor = doctorService.findByAccount(doctorAccount);

        // Validate referral type and required fields
        validateReferralRequest(request);

        // Parse expiry date
        LocalDate expiryDate = DateTimeUtil.stringToLocalDate(request.expiryDate())
                .orElseThrow(() -> {
                    log.warn("Invalid expiry date format: {}", request.expiryDate());
                    return new InvalidInputException("Invalid expiry date format");
                });

        // Validate expiry date is in the future
        if (expiryDate.isBefore(LocalDate.now())) {
            throw new InvalidInputException("Expiry date must be in the future");
        }

        // Build referral
        Referral.ReferralBuilder referralBuilder = Referral.builder()
                .patient(patient)
                .referringDoctor(referringDoctor)
                .referralType(request.referralType())
                .priority(request.priority())
                .clinicalSummary(request.clinicalSummary())
                .reasonForReferral(request.reasonForReferral())
                .investigationsDone(request.investigationsDone())
                .currentMedications(request.currentMedications())
                .allergies(request.allergies())
                .vitalSigns(request.vitalSigns())
                .expiryDate(expiryDate)
                .notes(request.notes());

        // Handle internal and external referrals
        if (request.referralType() == ReferralType.INTERNAL) {
            Doctor referredDoctor = doctorService.findById(request.referredDoctorId());

            // Validate doctor is not referring to themselves
            if (referringDoctor.getId().equals(referredDoctor.getId())) {
                throw new InvalidInputException("Doctor cannot refer to themselves");
            }

            referralBuilder.referredDoctor(referredDoctor);
        } else {
            referralBuilder.externalDoctorName(request.externalDoctorName())
                    .externalDoctorSpeciality(request.externalDoctorSpeciality())
                    .externalFacilityName(request.externalFacilityName())
                    .externalFacilityAddress(request.externalFacilityAddress())
                    .externalContactNumber(request.externalContactNumber())
                    .externalEmail(request.externalEmail());
        }

        // Save referral
        Referral referral = referralRepository.save(referralBuilder.build());

        // Publish referral created event for notification emails
        ReferralCreatedEvent referralEvent = ReferralCreatedEvent.builder()
                .referral(referral)
                .build();
        eventPublisher.publishEvent(referralEvent);

        log.info("Referral created successfully: {}", maskReferralNumber(referral.getReferralNumber()));
    }

    @Transactional
    public void updateReferralStatus(UUID referralId, Account doctorAccount, UpdateReferralStatusRequestDto request)
            throws AppException {
        log.info("Updating referral status: {} to {}", referralId, request.status());

        Referral referral = findById(referralId);
        Doctor doctor = doctorService.findByAccount(doctorAccount);

        // Validate doctor can update this referral
        if (referral.getReferralType() == ReferralType.INTERNAL) {
            if (!referral.getReferredDoctor().getId().equals(doctor.getId())) {
                throw new AppException("Not authorized to update this referral");
            }
        } else {
            // For external referrals, only the referring doctor can update
            if (!referral.getReferringDoctor().getId().equals(doctor.getId())) {
                throw new AppException("Not authorized to update this referral");
            }
        }

        // Validate status transition
        validateStatusTransition(referral.getStatus(), request.status());

        // Update status and related fields
        referral.setStatus(request.status());

        switch (request.status()) {
            case ACCEPTED -> referral.setAcceptedAt(Instant.now());
            case REJECTED -> {
                referral.setRejectedAt(Instant.now());
                if (request.rejectionReason() != null) {
                    referral.setRejectionReason(request.rejectionReason());
                }
            }
            case COMPLETED -> referral.setCompletedAt(Instant.now());
            case CANCELLED -> referral.setNotes(request.notes());
        }

        if (request.notes() != null) {
            referral.setNotes(request.notes());
        }

        referralRepository.save(referral);
        log.info("Referral status updated successfully: {} -> {}", referralId, request.status());
    }

    @Transactional
    public void scheduleAppointment(UUID referralId, UUID timeSlotId, Account doctorAccount) throws AppException {
        log.info("Scheduling appointment for referral: {} with time slot: {}", referralId, timeSlotId);

        Referral referral = findById(referralId);
        Doctor doctor = doctorService.findByAccount(doctorAccount);

        // Validate referral is internal and doctor is the referred doctor
        if (referral.getReferralType() != ReferralType.INTERNAL) {
            throw new InvalidInputException("Can only schedule appointments for internal referrals");
        }

        if (!referral.getReferredDoctor().getId().equals(doctor.getId())) {
            throw new AppException("Not authorized to schedule appointment for this referral");
        }

        // Validate referral status
        if (referral.getStatus() != ReferralStatus.ACCEPTED) {
            throw new InvalidInputException("Can only schedule appointments for accepted referrals");
        }

        // Use thread-safe time slot booking
        TimeSlot timeSlot = timeSlotService.bookTimeSlotSafely(timeSlotId);

        // Validate time slot belongs to the doctor
        if (!timeSlot.getDoctor().getId().equals(doctor.getId())) {
            throw new InvalidInputException("Time slot does not belong to the doctor");
        }

        try {
            // Create appointment with PENDING status (automated scheduler will handle
            // transitions)
            Appointment appointment = Appointment.builder()
                    .patient(referral.getPatient())
                    .doctor(doctor)
                    .timeSlot(timeSlot)
                    .status(AppointmentStatus.PENDING) // Start at PENDING for physical appointments
                    .consultationMode(timeSlot.getConsultationMode()) // Use time slot's consultation mode
                    .reasonForVisit("Referral: " + referral.getReasonForReferral())
                    .doctorNotes(referral.getClinicalSummary())
                    .referral(referral)
                    .build();

            // Save appointment directly (no manual scheduling needed)
            Appointment savedAppointment = appointmentRepository.save(appointment);

            // Update referral status
            referral.setStatus(ReferralStatus.SCHEDULED);
            referral.setScheduledAppointment(savedAppointment);
            referralRepository.save(referral);

            log.info("Appointment scheduled successfully for referral: {} with appointment: {}",
                    referralId, savedAppointment.getId());
        } catch (Exception e) {
            // Release time slot if appointment creation fails
            timeSlotService.releaseTimeSlotSafely(timeSlotId);
            log.error("Failed to schedule appointment for referral: {}", referralId, e);
            throw new AppException("Failed to schedule appointment for referral");
        }
    }

    @Transactional
    public void processExpiredReferrals() {
        log.info("Processing expired referrals");

        List<Referral> expiredReferrals = referralRepository.findExpiredReferrals(LocalDate.now());

        for (Referral referral : expiredReferrals) {
            referral.setStatus(ReferralStatus.EXPIRED);
            referralRepository.save(referral);
            log.info("Expired referral marked: {}", maskReferralNumber(referral.getReferralNumber()));
        }

        log.info("Processed {} expired referrals", expiredReferrals.size());
    }

    @Transactional(readOnly = true)
    public ReferralStatisticsDto getReferralStatistics(Account doctorAccount) throws AppException {
        log.debug("Getting referral statistics for doctor: {}", doctorAccount.getId());

        Doctor doctor = doctorService.findByAccount(doctorAccount);

        long pendingCount = referralRepository.countByReferredDoctorAndStatus(doctor, ReferralStatus.PENDING);
        long acceptedCount = referralRepository.countByReferredDoctorAndStatus(doctor, ReferralStatus.ACCEPTED);
        long scheduledCount = referralRepository.countByReferredDoctorAndStatus(doctor, ReferralStatus.SCHEDULED);
        long completedCount = referralRepository.countByReferredDoctorAndStatus(doctor, ReferralStatus.COMPLETED);

        return new ReferralStatisticsDto(pendingCount, acceptedCount, scheduledCount, completedCount);
    }

    private void validateReferralRequest(CreateReferralRequestDto request) throws InvalidInputException {
        if (request.referralType() == ReferralType.INTERNAL) {
            if (request.referredDoctorId() == null) {
                throw new InvalidInputException("Referred doctor ID is required for internal referrals");
            }
        } else {
            if (request.externalDoctorName() == null || request.externalFacilityName() == null) {
                throw new InvalidInputException(
                        "External doctor name and facility name are required for external referrals");
            }
        }
    }

    private void validateStatusTransition(ReferralStatus currentStatus, ReferralStatus newStatus)
            throws InvalidInputException {
        boolean isValidTransition = switch (currentStatus) {
            case PENDING -> newStatus == ReferralStatus.ACCEPTED ||
                    newStatus == ReferralStatus.REJECTED ||
                    newStatus == ReferralStatus.CANCELLED ||
                    newStatus == ReferralStatus.EXPIRED;
            case ACCEPTED -> newStatus == ReferralStatus.SCHEDULED ||
                    newStatus == ReferralStatus.CANCELLED;
            case SCHEDULED -> newStatus == ReferralStatus.COMPLETED ||
                    newStatus == ReferralStatus.CANCELLED;
            case REJECTED, COMPLETED, EXPIRED, CANCELLED -> false; // Terminal states
        };

        if (!isValidTransition) {
            throw new InvalidInputException("Invalid status transition from " + currentStatus + " to " + newStatus);
        }
    }

    /**
     * Masks a referral number by keeping the "REF" prefix and last 4 characters,
     * masking the rest.
     * Example: REF-1234567890 -> REF-******7890
     */
    private String maskReferralNumber(String referralNumber) {
        if (referralNumber == null || !referralNumber.startsWith("REF-") || referralNumber.length() <= 8) {
            return "REF-****";
        }

        String prefix = "REF-";
        String middlePart = referralNumber.substring(4, referralNumber.length() - 4);
        String maskedMiddle = "*".repeat(middlePart.length());
        String lastFour = referralNumber.substring(referralNumber.length() - 4);

        return prefix + maskedMiddle + lastFour;
    }
}
