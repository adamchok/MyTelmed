package com.mytelmed.core.appointment.service;

import com.mytelmed.common.advice.AppException;
import com.mytelmed.common.advice.exception.ResourceNotFoundException;
import com.mytelmed.common.constant.appointment.AppointmentStatus;
import com.mytelmed.common.constant.appointment.ConsultationMode;
import com.mytelmed.common.constant.family.FamilyPermissionType;
import com.mytelmed.common.event.appointment.model.AppointmentBookedEvent;
import com.mytelmed.common.event.appointment.model.AppointmentCancelledEvent;
import com.mytelmed.core.appointment.dto.AddAppointmentDocumentRequestDto;
import com.mytelmed.core.appointment.dto.BookAppointmentRequestDto;
import com.mytelmed.core.appointment.dto.UpdateAppointmentRequestDto;
import com.mytelmed.core.appointment.entity.Appointment;
import com.mytelmed.core.appointment.entity.AppointmentDocument;
import com.mytelmed.core.appointment.repository.AppointmentDocumentRepository;
import com.mytelmed.core.appointment.repository.AppointmentRepository;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.chat.service.ChatService;
import com.mytelmed.core.doctor.entity.Doctor;
import com.mytelmed.core.doctor.service.DoctorService;
import com.mytelmed.core.document.entity.Document;
import com.mytelmed.core.document.service.DocumentService;
import com.mytelmed.core.family.service.FamilyMemberPermissionService;
import com.mytelmed.core.patient.entity.Patient;
import com.mytelmed.core.patient.service.PatientService;
import com.mytelmed.core.payment.repository.BillRepository;
import com.mytelmed.core.payment.service.PaymentRefundService;
import com.mytelmed.core.timeslot.entity.TimeSlot;
import com.mytelmed.core.timeslot.service.TimeSlotService;
import com.mytelmed.core.videocall.entity.VideoCall;
import com.mytelmed.core.videocall.repository.VideoCallRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;


/**
 * Service for managing appointments in Malaysian public healthcare
 * telemedicine.
 * Supports both PHYSICAL and VIRTUAL consultation modes with proper validation.
 */
@Slf4j
@Service
public class AppointmentService {
    private final AppointmentRepository appointmentRepository;
    private final AppointmentDocumentRepository appointmentDocumentRepository;
    private final TimeSlotService timeSlotService;
    private final PatientService patientService;
    private final DoctorService doctorService;
    private final DocumentService documentService;
    private final ChatService chatService;
    private final ApplicationEventPublisher eventPublisher;
    private final VideoCallRepository videoCallRepository;
    private final BillRepository billRepository;
    private final AppointmentStateMachine appointmentStateMachine;
    private final PaymentRefundService paymentRefundService;
    private final FamilyMemberPermissionService familyMemberPermissionService;

    public AppointmentService(AppointmentRepository appointmentRepository,
                              AppointmentDocumentRepository appointmentDocumentRepository,
                              TimeSlotService timeSlotService,
                              PatientService patientService,
                              DoctorService doctorService,
                              DocumentService documentService,
                              ChatService chatService,
                              ApplicationEventPublisher eventPublisher,
                              VideoCallRepository videoCallRepository,
                              BillRepository billRepository,
                              AppointmentStateMachine appointmentStateMachine,
                              PaymentRefundService paymentRefundService,
                              FamilyMemberPermissionService familyMemberPermissionService) {
        this.appointmentRepository = appointmentRepository;
        this.appointmentDocumentRepository = appointmentDocumentRepository;
        this.timeSlotService = timeSlotService;
        this.patientService = patientService;
        this.doctorService = doctorService;
        this.documentService = documentService;
        this.chatService = chatService;
        this.eventPublisher = eventPublisher;
        this.videoCallRepository = videoCallRepository;
        this.billRepository = billRepository;
        this.appointmentStateMachine = appointmentStateMachine;
        this.paymentRefundService = paymentRefundService;
        this.familyMemberPermissionService = familyMemberPermissionService;
    }

    @Transactional(readOnly = true)
    public Appointment findById(UUID appointmentId) throws ResourceNotFoundException {
        log.debug("Finding appointment with ID {}", appointmentId);

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> {
                    log.warn("Appointment not found with ID {}", appointmentId);
                    return new ResourceNotFoundException("Appointment not found");
                });

        log.debug("Found appointment with ID {}", appointmentId);
        return appointment;
    }

    @Transactional(readOnly = true)
    public Page<Appointment> findByAccount(Account account, int page, int pageSize) throws AppException {
        Pageable pageable = PageRequest.of(page, pageSize);

        switch (account.getPermission().getType()) {
            case PATIENT -> {
                // Get all patient IDs this account is authorized to access
                List<UUID> authorizedPatientIds = familyMemberPermissionService.getAuthorizedPatientIds(account);
                if (authorizedPatientIds.isEmpty()) {
                    throw new AppException("Account is not authorized to view any patient appointments");
                }

                // Get appointments for all authorized patients
                List<Appointment> allAppointments = new ArrayList<>();
                for (UUID patientId : authorizedPatientIds) {
                    // Verify the account has VIEW_APPOINTMENT permission for each patient
                    if (familyMemberPermissionService.hasPermission(account, patientId, FamilyPermissionType.VIEW_APPOINTMENTS)) {
                        Page<Appointment> patientAppointments = appointmentRepository.findByPatientIdOrderByTimeSlotStartTimeDesc(patientId, Pageable.unpaged());
                        allAppointments.addAll(patientAppointments.getContent());
                    }
                }

                // Sort appointments by time slot start time (most recent first)
                allAppointments.sort((a1, a2) -> a2.getTimeSlot().getStartTime().compareTo(a1.getTimeSlot().getStartTime()));

                // Apply pagination manually
                int start = (int) pageable.getOffset();
                int end = Math.min(start + pageable.getPageSize(), allAppointments.size());
                List<Appointment> paginatedAppointments = start < allAppointments.size() ?
                        allAppointments.subList(start, end) : new ArrayList<>();

                return new PageImpl<>(paginatedAppointments, pageable, allAppointments.size());
            }
            case DOCTOR -> {
                Doctor doctor = doctorService.findByAccount(account);
                return appointmentRepository.findByDoctorIdOrderByTimeSlotStartTimeDesc(doctor.getId(), pageable);
            }
            default -> {
                log.warn("Account {} has no permission to fetch appointments", account.getId());
                throw new AppException("Account does not have permission to view appointments");
            }
        }
    }

    @Transactional(readOnly = true)
    public List<Appointment> findByAllAccount(Account account) throws AppException {
        switch (account.getPermission().getType()) {
            case PATIENT -> {
                // Get all patient IDs this account is authorized to access
                List<UUID> authorizedPatientIds = familyMemberPermissionService.getAuthorizedPatientIds(account);
                if (authorizedPatientIds.isEmpty()) {
                    throw new AppException("Account is not authorized to view any patient appointments");
                }

                // Get appointments for all authorized patients
                List<Appointment> allAppointments = new ArrayList<>();
                for (UUID patientId : authorizedPatientIds) {
                    // Verify the account has VIEW_APPOINTMENT permission for each patient
                    if (familyMemberPermissionService.hasPermission(account, patientId, FamilyPermissionType.VIEW_APPOINTMENTS)) {
                        List<Appointment> patientAppointments = appointmentRepository.findByPatientIdOrderByTimeSlotStartTimeDesc(patientId);
                        allAppointments.addAll(patientAppointments);
                    }
                }

                // Sort appointments by time slot start time (most recent first)
                allAppointments.sort((a1, a2) -> a2.getTimeSlot().getStartTime().compareTo(a1.getTimeSlot().getStartTime()));

                return allAppointments;
            }
            case DOCTOR -> {
                Doctor doctor = doctorService.findByAccount(account);
                return appointmentRepository.findByDoctorIdOrderByTimeSlotStartTimeDesc(doctor.getId());
            }
            default -> {
                log.warn("Account {} has no permission to fetch all appointments", account.getId());
                throw new AppException("Account does not have permission to view appointments");
            }
        }
    }

    @Transactional
    public UUID book(Account account, BookAppointmentRequestDto request) throws AppException {
        log.debug("Booking {} appointment for account {} with request {}",
                request.consultationMode(), account.getId(), request);

        // Get all patient IDs this account is authorized to access
        List<UUID> authorizedPatientIds = familyMemberPermissionService.getAuthorizedPatientIds(account);
        if (authorizedPatientIds.isEmpty()) {
            throw new AppException("Account is not authorized to book appointments for any patient");
        }

        UUID targetPatientId;
        if (authorizedPatientIds.size() == 1) {
            targetPatientId = authorizedPatientIds.getFirst();
        } else {
            targetPatientId = authorizedPatientIds.stream()
                    .filter(patientId -> patientId.equals(request.patientId()))
                    .findFirst().orElse(null);
        }

        // Verify the account has BOOK_APPOINTMENT permission for the target patient
        if (!familyMemberPermissionService.hasPermission(account, targetPatientId,
                FamilyPermissionType.MANAGE_APPOINTMENTS)) {
            throw new AppException("Insufficient permissions to book appointments");
        }

        try {
            Patient patient = patientService.findPatientById(targetPatientId);
            Doctor doctor = doctorService.findById(request.doctorId());

            // Validate business rules first
            validateAppointmentBooking(patient, doctor, request);

            // Use thread-safe time slot booking with pessimistic locking
            TimeSlot timeSlot = timeSlotService.bookTimeSlotSafely(request.timeSlotId());

            // Validate consultation mode compatibility (double-check after locking)
            if (!timeSlot.supportsConsultationMode(request.consultationMode())) {
                // Release the time slot if consultation mode doesn't match
                timeSlotService.releaseTimeSlotSafely(request.timeSlotId());
                throw new AppException(String.format(
                        "Time slot only supports %s appointments, but %s appointment was requested",
                        timeSlot.getConsultationMode(), request.consultationMode()));
            }

            // Determine initial appointment status based on consultation mode
            AppointmentStatus initialStatus = determineInitialAppointmentStatus(request.consultationMode());

            // Create appointment with consultation mode
            Appointment appointment = Appointment.builder()
                    .patient(patient)
                    .doctor(doctor)
                    .timeSlot(timeSlot)
                    .status(initialStatus)
                    .consultationMode(request.consultationMode())
                    .patientNotes(request.patientNotes())
                    .reasonForVisit(request.reasonForVisit())
                    .build();

            // Save appointment
            appointment = appointmentRepository.save(appointment);

            // Create video call placeholder for VIRTUAL appointments only
            if (appointment.requiresVideoCall()) {
                VideoCall videoCall = VideoCall.builder()
                        .appointment(appointment)
                        .isActive(false)
                        .build();
                videoCallRepository.save(videoCall);
                log.info("Created video call placeholder for virtual appointment: {}", appointment.getId());
            }

            // Attach document to appointment if any (with permission validation)
            if (request.documentRequestList() != null && !request.documentRequestList().isEmpty()) {
                attachDocumentsToAppointment(appointment, request.documentRequestList(), account);
            }

            // Create chat for both PHYSICAL and VIRTUAL appointments
            chatService.createChatAndStreamChannel(patient, doctor);

            // Publish booking event to trigger notifications
            publishAppointmentBookedEvent(appointment);

            log.info("Booked {} appointment with ID {} for patient {} with doctor {} by account {}",
                    appointment.getConsultationMode(), appointment.getId(), patient.getId(),
                    request.doctorId(), account.getId());

            return appointment.getId();
        } catch (Exception e) {
            log.error("Unexpected error while booking {} appointment", request.consultationMode(), e);
            throw new AppException("Failed to book appointment");
        }
    }

    /**
     * Validates comprehensive business rules for appointment booking
     */
    private void validateAppointmentBooking(Patient patient, Doctor doctor, BookAppointmentRequestDto request)
            throws AppException {

        // 1. Validate appointment timing
        TimeSlot timeSlot = timeSlotService.findById(request.timeSlotId());
        validateAppointmentTime(timeSlot.getStartTime());

        // 2. Validate doctor belongs to the time slot
        if (!timeSlot.getDoctor().getId().equals(doctor.getId())) {
            throw new AppException("Time slot does not belong to the selected doctor");
        }

        // 3. Check for conflicting appointments for the patient
        validateNoConflictingAppointments(patient, timeSlot);

        // 4. Validate consultation mode business rules
        validateConsultationModeRules(patient, doctor, request.consultationMode());

        // 5. Validate appointment window (e.g., can't book too far in advance)
        validateBookingWindow(timeSlot.getStartTime());

        // 6. Check if patient has any unpaid bills (business rule)
        validatePatientBillingStatus(patient);
    }

    /**
     * Validates no conflicting appointments for the patient
     */
    private void validateNoConflictingAppointments(Patient patient, TimeSlot requestedTimeSlot) throws AppException {
        List<Appointment> existingAppointments = appointmentRepository
                .findByPatientIdOrderByTimeSlotStartTimeDesc(patient.getId());

        for (Appointment existingAppointment : existingAppointments) {
            // Skip cancelled or completed appointments
            if (existingAppointment.getStatus() == AppointmentStatus.CANCELLED ||
                    existingAppointment.getStatus() == AppointmentStatus.COMPLETED) {
                continue;
            }

            TimeSlot existingTimeSlot = existingAppointment.getTimeSlot();

            // Check for time overlap
            if (timeSlotsOverlap(existingTimeSlot, requestedTimeSlot)) {
                throw new AppException("Patient already has an appointment during this time period");
            }
        }
    }

    /**
     * Validates consultation mode specific business rules
     */
    private void validateConsultationModeRules(Patient patient, Doctor doctor, ConsultationMode consultationMode)
            throws AppException {

        if (consultationMode == ConsultationMode.VIRTUAL) {
            // Virtual consultation specific validations
            validateVirtualConsultationEligibility(patient);
            validateDoctorVirtualCapability(doctor);
        } else if (consultationMode == ConsultationMode.PHYSICAL) {
            // Physical consultation specific validations
            validatePhysicalConsultationRequirements(patient, doctor);
        }
    }

    /**
     * Validates booking window constraints
     */
    private void validateBookingWindow(LocalDateTime appointmentTime) throws AppException {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime maxAdvanceBooking = now.plusWeeks(3); // 3 weeks advance booking limit
        LocalDateTime minAdvanceBooking = now.plusHours(24); // Minimum 24 hours advance booking

        if (appointmentTime.isAfter(maxAdvanceBooking)) {
            throw new AppException("Cannot book appointments more than 3 weeks in advance");
        }

        if (appointmentTime.isBefore(minAdvanceBooking)) {
            throw new AppException("Cannot book appointments less than 24 hours in advance");
        }
    }

    /**
     * Validates patient billing status
     */
    private void validatePatientBillingStatus(Patient patient) throws AppException {
        // This would check if patient has too many unpaid bills
        // Implementation depends on your business rules
        long unpaidBillsCount = billRepository.countUnpaidBillsByPatient(patient.getId());
        if (unpaidBillsCount > 3) {
            throw new AppException("Cannot book new appointments. Please settle outstanding bills first.");
        }
    }

    /**
     * Validates virtual consultation eligibility
     */
    private void validateVirtualConsultationEligibility(Patient patient) throws AppException {
        // Business rules for virtual consultations
        // Example: Patient must be above certain age, have no critical conditions, etc.

        // Calculate age
        int age = java.time.Period.between(patient.getDateOfBirth(), java.time.LocalDate.now()).getYears();
        if (age < 13) {
            throw new AppException("Virtual consultations are not available for patients under 13 years old");
        }
    }

    /**
     * Validates doctor virtual capability
     */
    private void validateDoctorVirtualCapability(Doctor doctor) throws AppException {
        // Check if doctor is authorized for virtual consultations
        // This could be a field in doctor entity or determined by subject

        // For now, assume all doctors can do virtual consultations
        // In real implementation, you might check doctor.isVirtualConsultationEnabled()
    }

    /**
     * Validates physical consultation requirements
     */
    private void validatePhysicalConsultationRequirements(Patient patient, Doctor doctor) throws AppException {
        // Check if patient and doctor are in the same facility catchment area
        // This is more relevant for public healthcare systems

        // For now, assume all physical consultations are allowed
        // In real implementation, you might check geographical constraints
    }

    /**
     * Determines initial appointment status based on consultation mode
     * Virtual appointments require payment first (PENDING_PAYMENT)
     * Physical appointments start directly at PENDING
     */
    private AppointmentStatus determineInitialAppointmentStatus(ConsultationMode consultationMode) {
        return switch (consultationMode) {
            case VIRTUAL -> AppointmentStatus.PENDING_PAYMENT; // Virtual consultations require payment before
            // confirmation
            case PHYSICAL -> AppointmentStatus.PENDING; // Physical consultations don't require upfront payment
        };
    }

    /**
     * Checks if two time slots overlap
     */
    private boolean timeSlotsOverlap(TimeSlot slot1, TimeSlot slot2) {
        return slot1.getStartTime().isBefore(slot2.getEndTime()) &&
                slot2.getStartTime().isBefore(slot1.getEndTime());
    }

    @Transactional
    public void cancelAppointment(Account account, UUID appointmentId, String reason) throws AppException {
        log.debug("Cancelling appointment {} by account {}", appointmentId, account.getId());

        // Find the appointment
        Appointment appointment = findById(appointmentId);

        // Verify if the appointment can be canceled (using state machine)
        if (!appointmentStateMachine.canTransition(appointment.getStatus(), AppointmentStatus.CANCELLED)) {
            throw new AppException(String.format("Cannot cancel appointment in %s status", appointment.getStatus()));
        }

        // Verify authorization
        boolean isAuthorized = false;

        switch (account.getPermission().getType()) {
            case PATIENT -> {
                // Check if account is authorized for this patient and has cancel permission
                isAuthorized = familyMemberPermissionService.isAuthorizedForPatient(
                        account, appointment.getPatient().getId(), FamilyPermissionType.MANAGE_APPOINTMENTS);
            }
            case DOCTOR -> {
                isAuthorized = appointment.getDoctor().getAccount().getId().equals(account.getId());
            }
        }

        if (!isAuthorized) {
            throw new AppException("Unauthorized to cancel this appointment");
        }

        try {
            // Process refund for virtual appointments before cancellation
            if (appointment.getConsultationMode() == ConsultationMode.VIRTUAL &&
                    paymentRefundService.isAppointmentEligibleForRefund(appointment)) {

                log.info("Processing refund for cancelled virtual appointment: {}", appointmentId);
                try {
                    PaymentRefundService.RefundResult refundResult = paymentRefundService
                            .processAppointmentCancellationRefund(appointmentId, reason, account);

                    if (refundResult.isSuccessful() && refundResult.getRefund() != null) {
                        log.info("Successfully processed refund for cancelled appointment: {} - Refund ID: {}",
                                appointmentId, refundResult.getRefund().getId());
                    } else {
                        log.info("Refund processing completed for appointment: {} - {}",
                                appointmentId, refundResult.getMessage());
                    }
                } catch (Exception refundException) {
                    // Log refund failure but don't prevent cancellation
                    log.error("Failed to process refund for cancelled appointment: {} - {}",
                            appointmentId, refundException.getMessage());
                    // Continue with cancellation even if refund fails
                }
            }

            // Use state machine to validate transition
            appointmentStateMachine.validateTransition(
                    appointment.getStatus(),
                    AppointmentStatus.CANCELLED,
                    appointment.getConsultationMode());

            // Cancel the appointment
            appointment.setStatus(AppointmentStatus.CANCELLED);
            appointment.setCancellationReason(reason);

            // Free up the time slot using thread-safe method
            timeSlotService.releaseTimeSlotSafely(appointment.getTimeSlot().getId());

            // Save appointment
            appointmentRepository.save(appointment);

            // Publish cancellation event to trigger email notifications
            publishAppointmentCancelledEvent(appointment);

            log.info("Cancelled appointment with ID {} ({} → CANCELLED)", appointmentId, appointment.getStatus());
        } catch (Exception e) {
            log.error("Unexpected error while cancelling appointment {}", appointmentId, e);
            throw new AppException("Failed to cancel appointment");
        }
    }

    /**
     * Starts a virtual appointment by transitioning from READY_FOR_CALL to
     * IN_PROGRESS.
     * This happens when both patient (or family member) and doctor join the video
     * call.
     */
    @Transactional
    public void startVirtualAppointment(UUID appointmentId, Account account) throws AppException {
        log.debug("Starting virtual appointment: {} by account: {}", appointmentId, account.getId());

        Appointment appointment = findById(appointmentId);

        // Validate that this is a virtual appointment
        if (!appointment.isVirtualConsultation()) {
            throw new AppException("This method is only for VIRTUAL appointments. This is a " +
                    appointment.getConsultationMode() + " appointment.");
        }

        // Validate appointment is in READY_FOR_CALL status
        if (appointment.getStatus() != AppointmentStatus.READY_FOR_CALL) {
            throw new AppException("Virtual appointment must be in READY_FOR_CALL status to start");
        }

        // Validate authorization
        boolean isAuthorized = false;
        switch (account.getPermission().getType()) {
            case PATIENT -> {
                isAuthorized = familyMemberPermissionService.isAuthorizedForPatient(
                        account, appointment.getPatient().getId(), FamilyPermissionType.JOIN_VIDEO_CALL);
            }
            case DOCTOR -> {
                isAuthorized = appointment.getDoctor().getAccount().getId().equals(account.getId());
            }
        }

        if (!isAuthorized) {
            throw new AppException("You are not authorized to start this appointment");
        }

        try {
            // Use state machine to validate transition
            appointmentStateMachine.validateTransition(
                    appointment.getStatus(),
                    AppointmentStatus.IN_PROGRESS,
                    appointment.getConsultationMode());

            appointment.setStatus(AppointmentStatus.IN_PROGRESS);
            appointmentRepository.save(appointment);

            log.info("Started virtual appointment: {} (READY_FOR_CALL → IN_PROGRESS)", appointmentId);
        } catch (Exception e) {
            log.error("Failed to start virtual appointment: {}", appointmentId, e);
            throw new AppException("Failed to start virtual appointment");
        }
    }

    /**
     * Completes an appointment (both PHYSICAL and VIRTUAL).
     * This is manually triggered by the doctor when the appointment is finished.
     */
    @Transactional
    public void completeAppointment(UUID appointmentId, Account doctorAccount, String doctorNotes) throws AppException {
        log.debug("Completing appointment: {}", appointmentId);

        Appointment appointment = findById(appointmentId);

        // Validate doctor authorization
        if (!appointment.getDoctor().getAccount().getId().equals(doctorAccount.getId())) {
            throw new AppException("You are not authorized to complete this appointment");
        }

        // Use state machine to validate transition
        appointmentStateMachine.validateTransition(
                appointment.getStatus(),
                AppointmentStatus.COMPLETED,
                appointment.getConsultationMode());

        try {
            appointment.setStatus(AppointmentStatus.COMPLETED);
            appointment.setDoctorNotes(doctorNotes);
            appointment.setCompletedAt(java.time.Instant.now());
            appointmentRepository.save(appointment);

            log.info("Completed {} appointment: {} (IN_PROGRESS → COMPLETED)",
                    appointment.getConsultationMode(), appointmentId);
        } catch (Exception e) {
            log.error("Failed to complete appointment: {}", appointmentId, e);
            throw new AppException("Failed to complete appointment");
        }
    }

    /**
     * Updates appointment details (notes, reason, documents).
     * Only allowed for PENDING and PENDING_PAYMENT appointments.
     */
    @Transactional
    public void updateAppointmentDetails(Account account, UUID appointmentId, UpdateAppointmentRequestDto request)
            throws AppException {
        log.debug("Updating appointment {} by account {}", appointmentId, account.getId());

        // Find appointment
        Appointment appointment = findById(appointmentId);

        // Verify authorization - account must be authorized for this patient
        if (!familyMemberPermissionService.isAuthorizedForPatient(account, appointment.getPatient().getId(),
                FamilyPermissionType.VIEW_APPOINTMENTS)) {
            throw new AppException("Unauthorized to modify this appointment");
        }

        // Check if the appointment can be modified (only before confirmation)
        if (!appointment.getStatus().equals(AppointmentStatus.PENDING) &&
                !appointment.getStatus().equals(AppointmentStatus.PENDING_PAYMENT)) {
            throw new AppException("Can only modify PENDING or PENDING_PAYMENT appointments");
        }

        try {
            // Update appointment
            appointment.setPatientNotes(request.patientNotes());
            appointment.setReasonForVisit(request.reasonForVisit());
            updateAppointmentDocuments(appointment, request.documentRequestList(), account);

            // Save updated appointment
            appointmentRepository.save(appointment);

            log.info("Updated appointment details for ID {}", appointmentId);
        } catch (Exception e) {
            log.error("Unexpected error while updating appointment {}", appointmentId, e);
            throw new AppException("Failed to update appointment");
        }
    }

    private void publishAppointmentBookedEvent(Appointment appointment) {
        try {
            AppointmentBookedEvent event = AppointmentBookedEvent.builder()
                    .appointmentId(appointment.getId())
                    .patient(appointment.getPatient())
                    .doctor(appointment.getDoctor())
                    .appointmentDateTime(appointment.getTimeSlot().getStartTime())
                    .consultationMode(appointment.getConsultationMode())
                    .reasonForVisit(appointment.getReasonForVisit())
                    .patientNotes(appointment.getPatientNotes())
                    .build();

            eventPublisher.publishEvent(event);
            log.info("Published AppointmentBookedEvent for {} appointment {}",
                    appointment.getConsultationMode(), appointment.getId());
        } catch (Exception e) {
            log.error("Failed to publish AppointmentBookedEvent for appointment {}",
                    appointment.getId(), e);
        }
    }

    private void publishAppointmentCancelledEvent(Appointment appointment) {
        try {
            AppointmentCancelledEvent event = AppointmentCancelledEvent.builder()
                    .appointmentId(appointment.getId())
                    .patient(appointment.getPatient())
                    .doctor(appointment.getDoctor())
                    .appointmentDateTime(appointment.getTimeSlot().getStartTime())
                    .consultationMode(appointment.getConsultationMode())
                    .reasonForVisit(appointment.getReasonForVisit())
                    .cancellationReason(appointment.getCancellationReason())
                    .build();

            eventPublisher.publishEvent(event);
            log.info("Published AppointmentCancelledEvent for {} appointment {}",
                    appointment.getConsultationMode(), appointment.getId());
        } catch (Exception e) {
            log.error("Failed to publish AppointmentCancelledEvent for appointment {}",
                    appointment.getId(), e);
        }
    }

    private void validateAppointmentTime(LocalDateTime appointmentDateTime)
            throws AppException {
        LocalDateTime now = LocalDateTime.now();

        if (appointmentDateTime.isBefore(now.plusHours(24))) {
            throw new AppException("Appointment must be scheduled at least 24 hours in advance");
        }

        if (appointmentDateTime.isAfter(now.plusWeeks(3))) {
            throw new AppException("Appointment cannot be scheduled more than 3 weeks in advance");
        }
    }

    private void validateAppointmentScheduling(Appointment appointment) throws AppException {
        LocalDateTime now = LocalDateTime.now();

        if (appointment.getTimeSlot().getStartTime().isBefore(now.plusWeeks(1))) {
            throw new AppException("Appointment must be scheduled at least 1 week in advance");
        }
    }

    private void attachDocumentsToAppointment(Appointment appointment,
                                              List<AddAppointmentDocumentRequestDto> requestList,
                                              Account requestingAccount) throws AppException {
        requestList.forEach(request -> {
            try {
                // Find the document
                Document document = documentService.findById(request.documentId());

                // Validate the document belongs to the patient
                if (!document.getPatient().getId().equals(appointment.getPatient().getId())) {
                    log.warn("Document {} does not belong to the patient {}",
                            request.documentId(), appointment.getPatient().getId());
                    return;
                }

                // Validate the requesting account has attach permission for this document
                if (!familyMemberPermissionService.hasPermission(requestingAccount, appointment.getPatient().getId(),
                        FamilyPermissionType.VIEW_MEDICAL_RECORDS)) {
                    log.warn("Account {} does not have attach permission for patient {} documents",
                            requestingAccount.getId(), appointment.getPatient().getId());
                    return;
                }

                if (!appointmentDocumentRepository.existsByAppointmentIdAndDocumentId(appointment.getId(),
                        request.documentId())) {
                    // Create appointment document
                    AppointmentDocument appointmentDoc = AppointmentDocument.builder()
                            .appointment(appointment)
                            .document(document)
                            .notes(request.notes())
                            .build();

                    // Save appointment document
                    appointmentDocumentRepository.save(appointmentDoc);
                }
            } catch (ResourceNotFoundException e) {
                log.warn("Document {} not found for patient {}",
                        request.documentId(), appointment.getPatient().getId(), e);
            }
        });
    }

    private void updateAppointmentDocuments(Appointment appointment,
                                            List<AddAppointmentDocumentRequestDto> requestList,
                                            Account requestingAccount)
            throws AppException {
        // Remove existing documents
        appointmentDocumentRepository.deleteByAppointmentId(appointment.getId());

        if (requestList != null && !requestList.isEmpty()) {
            requestList.forEach(request -> {
                try {
                    // Find the document
                    Document document = documentService.findById(request.documentId());

                    // Verify if the document belongs to the patient
                    if (!document.getPatient().getId().equals(appointment.getPatient().getId())) {
                        log.warn("Document {} does not belong to the patient {}",
                                document.getId(), appointment.getPatient().getId());
                        return;
                    }

                    // Validate the requesting account has attach permission for this document
                    if (!familyMemberPermissionService.hasPermission(requestingAccount, appointment.getPatient().getId(),
                            FamilyPermissionType.VIEW_MEDICAL_RECORDS)) {
                        log.warn("Account {} does not have attach permission for patient {} documents",
                                requestingAccount.getId(), appointment.getPatient().getId());
                        return;
                    }

                    // Create new appointment document
                    AppointmentDocument appointmentDoc = AppointmentDocument.builder()
                            .appointment(appointment)
                            .document(document)
                            .notes(request.notes())
                            .build();

                    // Save appointment document
                    appointmentDocumentRepository.save(appointmentDoc);
                } catch (ResourceNotFoundException e) {
                    log.warn("Document {} not found for patient {}",
                            request.documentId(), appointment.getPatient().getId(), e);
                }
            });
        }
    }
}
