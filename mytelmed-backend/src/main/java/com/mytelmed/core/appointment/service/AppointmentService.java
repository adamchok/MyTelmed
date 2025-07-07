package com.mytelmed.core.appointment.service;

import com.mytelmed.common.advice.AppException;
import com.mytelmed.common.advice.exception.ResourceNotFoundException;
import com.mytelmed.common.constant.appointment.AppointmentStatus;
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
import com.mytelmed.core.patient.entity.Patient;
import com.mytelmed.core.patient.service.PatientService;
import com.mytelmed.core.timeslot.entity.TimeSlot;
import com.mytelmed.core.timeslot.service.TimeSlotService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;


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

    public AppointmentService(AppointmentRepository appointmentRepository,
                              AppointmentDocumentRepository appointmentDocumentRepository,
                              TimeSlotService timeSlotService,
                              PatientService patientService,
                              DoctorService doctorService,
                              DocumentService documentService,
                              ChatService chatService,
                              ApplicationEventPublisher eventPublisher) {
        this.appointmentRepository = appointmentRepository;
        this.appointmentDocumentRepository = appointmentDocumentRepository;
        this.timeSlotService = timeSlotService;
        this.patientService = patientService;
        this.doctorService = doctorService;
        this.documentService = documentService;
        this.chatService = chatService;
        this.eventPublisher = eventPublisher;
    }

    @PreAuthorize("hasAnyRole('DOCTOR', 'PATIENT')")
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

    @PreAuthorize("hasAnyRole('DOCTOR', 'PATIENT')")
    @Transactional(readOnly = true)
    public Page<Appointment> findByAccount(Account account, int page, int pageSize) throws AppException {
        Pageable pageable = PageRequest.of(page, pageSize);

        switch (account.getPermission().getType()) {
            case PATIENT -> {
                Patient patient = patientService.findPatientByAccountId(account.getId());
                return appointmentRepository.findByPatientIdOrderByTimeSlotStartTimeDesc(patient.getId(), pageable);
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

    @PreAuthorize("hasAnyRole('DOCTOR', 'PATIENT')")
    @Transactional(readOnly = true)
    public List<Appointment> findByAllAccount(Account account) throws AppException {
        switch (account.getPermission().getType()) {
            case PATIENT -> {
                Patient patient = patientService.findPatientByAccountId(account.getId());
                return appointmentRepository.findByPatientIdOrderByTimeSlotStartTimeDesc(patient.getId());
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

    @PreAuthorize("hasRole('PATIENT')")
    @Transactional
    public void book(Account account, BookAppointmentRequestDto request) throws AppException {
        log.debug("Booking appointment for patient account ID {}", account.getId());

        // Find the patient by account ID
        Patient patient = patientService.findPatientByAccountId(account.getId());

        // Find the doctor by doctor ID
        Doctor doctor = doctorService.findById(request.doctorId());

        // Find the time slot by time slot ID
        TimeSlot timeSlot = timeSlotService.findById(request.timeSlotId());

        if (!timeSlot.getDoctor().getId().equals(doctor.getId())) {
            throw new AppException("Time slot does not belong to the selected doctor");
        }

        if (timeSlot.getIsBooked() && !timeSlot.getIsAvailable()) {
            throw new AppException("Time slot is no longer available");
        }

        // Validate booking time logic
        validateAppointmentTime(timeSlot.getStartTime());

        try {
            // Update time slot
            timeSlot.setIsBooked(true);

            // Create appointment
            Appointment appointment = Appointment.builder()
                    .patient(patient)
                    .doctor(doctor)
                    .timeSlot(timeSlot)
                    .status(AppointmentStatus.PENDING)
                    .patientNotes(request.patientNotes())
                    .reasonForVisit(request.reasonForVisit())
                    .build();

            // Save appointment
            appointment = appointmentRepository.save(appointment);

            // Attach document to appointment if any
            if (request.documentRequestList() != null && !request.documentRequestList().isEmpty()) {
                attachDocumentsToAppointment(appointment, request.documentRequestList());
            }

            // Create chat chat
            chatService.createChatAndStreamChannel(patient, doctor);

            // Publish booking event to trigger notifications
            publishAppointmentBookedEvent(appointment);

            log.info("Booked appointment with ID {} for patient {} with doctor {}",
                    appointment.getId(), patient.getId(), request.doctorId());
        } catch (Exception e) {
            log.error("Unexpected error while booking appointment", e);
            throw new AppException("Failed to book appointment");
        }
    }

    @PreAuthorize("hasRole('DOCTOR')")
    @Transactional
    public void schedule(Appointment appointment) throws AppException {
        log.debug("Scheduling appointment with ID {} for doctor {}", appointment.getId(), appointment.getDoctor().getId());

        validateAppointmentScheduling(appointment);

        try {
            // Update time slot
            appointment.getTimeSlot().setIsBooked(true);

            // Save appointment
            appointment = appointmentRepository.save(appointment);

            // Create chat chat
            chatService.createChatAndStreamChannel(appointment.getPatient(), appointment.getDoctor());

            // Publish booking event to trigger notifications
            publishAppointmentBookedEvent(appointment);

            log.info("Scheduled appointment with ID {} for patient {} with doctor {}",
                    appointment.getId(), appointment.getPatient().getId(), appointment.getDoctor().getId());
        } catch (Exception e) {
            log.error("Unexpected error while scheduling appointment", e);
            throw new AppException("Failed to schedule appointment");
        }
    }

    @PreAuthorize("hasRole('PATIENT')")
    @Transactional
    public void update(Account account, UUID appointmentId, UpdateAppointmentRequestDto request)
            throws AppException {
        log.debug("Updating appointment {} by account {}", appointmentId, account.getId());

        // Find appointment
        Appointment appointment = findById(appointmentId);

        // Verify authorization
        if (!appointment.getPatient().getAccount().getId().equals(account.getId())) {
            throw new AppException("Unauthorized to modify this appointment");
        }

        // Check if the appointment can be modified
        if (!appointment.getStatus().equals(AppointmentStatus.PENDING)) {
            throw new AppException("Appointment cannot be modified in its current status");
        }

        try {
            // Update appointment
            appointment.setPatientNotes(request.patientNotes());
            appointment.setReasonForVisit(request.reasonForVisit());
            updateAppointmentDocuments(appointment, request.documentRequestList());

            // Save updated appointment
            appointmentRepository.save(appointment);

            log.info("Updated appointment with ID {}", appointmentId);
        } catch (Exception e) {
            log.error("Unexpected error while updating appointment {}", appointmentId, e);
            throw new AppException("Failed to update appointment");
        }
    }

    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR')")
    @Transactional
    public void cancelAppointment(Account account, UUID appointmentId, String reason) throws AppException {
        log.debug("Cancelling appointment {} by account {}", appointmentId, account.getId());

        // Find the appointment
        Appointment appointment = findById(appointmentId);

        // Verify if the appointment can be canceled
        if (!appointment.getStatus().equals(AppointmentStatus.PENDING)) {
            throw new AppException("Cannot cancel non-pending appointment");
        }

        // Verify authorization
        if (!appointment.getPatient().getAccount().getId().equals(account.getId()) ||
                !appointment.getDoctor().getAccount().getId().equals(account.getId())) {
            throw new AppException("Unauthorized to cancel this appointment");
        }

        try {
            // Cancel the appointment
            appointment.setStatus(AppointmentStatus.CANCELLED);
            appointment.setCancellationReason(reason);

            // Free up the time slot
            TimeSlot timeSlot = appointment.getTimeSlot();
            timeSlot.setIsBooked(false);
            timeSlot.setIsAvailable(true);

            // Save appointment
            appointmentRepository.save(appointment);

            // Publish cancellation event to trigger email notifications
            publishAppointmentCancelledEvent(appointment);

            log.info("Canceled appointment with ID {}", appointmentId);
        } catch (Exception e) {
            log.error("Unexpected error while cancelling appointment {}", appointmentId, e);
            throw new AppException("Failed to cancel appointment");
        }
    }

    private void publishAppointmentBookedEvent(Appointment appointment) {
        try {
            AppointmentBookedEvent event = AppointmentBookedEvent.builder()
                    .appointmentId(appointment.getId())
                    .patient(appointment.getPatient())
                    .doctor(appointment.getDoctor())
                    .appointmentDateTime(appointment.getTimeSlot().getStartTime())
                    .reasonForVisit(appointment.getReasonForVisit())
                    .patientNotes(appointment.getPatientNotes())
                    .build();

            eventPublisher.publishEvent(event);
            log.info("Published AppointmentBookedEvent for appointment {}", appointment.getId());
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
                    .reasonForVisit(appointment.getReasonForVisit())
                    .cancellationReason(appointment.getCancellationReason())
                    .build();

            eventPublisher.publishEvent(event);
            log.info("Published AppointmentCancelledEvent for appointment {}", appointment.getId());
        } catch (Exception e) {
            log.error("Failed to publish AppointmentCancelledEvent for appointment {}",
                    appointment.getId(), e);
        }
    }

    private void validateAppointmentTime(LocalDateTime appointmentDateTime)
            throws AppException {
        LocalDateTime now = LocalDateTime.now();

        if (appointmentDateTime.isBefore(now.plusHours(1))) {
            throw new AppException("Appointment must be scheduled at least 1 hour in advance");
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
                                              List<AddAppointmentDocumentRequestDto> requestList) throws AppException {
        requestList.forEach(request -> {
            try {
                // Find the document
                Document document = documentService.getDocumentById(request.documentId());

                // Validate the document
                if (!document.getPatient().getId().equals(appointment.getPatient().getId())) {
                    log.warn("Document {} does not belong to the patient {}",
                            request.documentId(), appointment.getPatient().getId());
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

    private void updateAppointmentDocuments(Appointment appointment, List<AddAppointmentDocumentRequestDto> requestList)
            throws AppException {
        // Remove existing documents
        appointmentDocumentRepository.deleteByAppointmentId(appointment.getId());

        requestList.forEach(request -> {
            try {
                // Find the document
                Document document = documentService.getDocumentById(request.documentId());

                // Verify if the document belongs to the patient
                if (!document.getPatient().getId().equals(appointment.getPatient().getId())) {
                    log.warn("Document {} does not belong to the patient {}",
                            document.getId(), appointment.getPatient().getId());
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
