package com.mytelmed.core.prescription.service;

import com.mytelmed.common.advice.AppException;
import com.mytelmed.common.advice.exception.ResourceNotFoundException;
import com.mytelmed.common.constant.appointment.AppointmentStatus;
import com.mytelmed.common.constant.prescription.PrescriptionStatus;
import com.mytelmed.common.event.prescription.model.PrescriptionCreatedEvent;
import com.mytelmed.core.appointment.entity.Appointment;
import com.mytelmed.core.appointment.service.AppointmentService;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.pharmacist.entity.Pharmacist;
import com.mytelmed.core.pharmacist.service.PharmacistService;
import com.mytelmed.core.prescription.dto.CreatePrescriptionRequestDto;
import com.mytelmed.core.prescription.entity.Prescription;
import com.mytelmed.core.prescription.entity.PrescriptionItem;
import com.mytelmed.core.prescription.repository.PrescriptionItemRepository;
import com.mytelmed.core.prescription.repository.PrescriptionRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;


/**
 * Service for managing medical prescriptions in Malaysian public healthcare
 * telemedicine.
 * Focuses on prescription lifecycle management separated from delivery
 * logistics.
 * Delivery concerns are handled by MedicationDeliveryService.
 */
@Slf4j
@Service
public class PrescriptionService {
    private final PrescriptionRepository prescriptionRepository;
    private final PrescriptionItemRepository prescriptionItemRepository;
    private final AppointmentService appointmentService;
    private final PharmacistService pharmacistService;
    private final ApplicationEventPublisher applicationEventPublisher;

    public PrescriptionService(PrescriptionRepository prescriptionRepository,
                               PrescriptionItemRepository prescriptionItemRepository,
                               AppointmentService appointmentService,
                               PharmacistService pharmacistService,
                               ApplicationEventPublisher applicationEventPublisher) {
        this.prescriptionRepository = prescriptionRepository;
        this.prescriptionItemRepository = prescriptionItemRepository;
        this.appointmentService = appointmentService;
        this.pharmacistService = pharmacistService;
        this.applicationEventPublisher = applicationEventPublisher;
    }

    @Transactional(readOnly = true)
    public Prescription findById(UUID prescriptionId) {
        log.info("Fetching prescription by ID: {}", prescriptionId);

        Prescription prescription = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> {
                    log.warn("Prescription not found for ID: {}", prescriptionId);
                    return new ResourceNotFoundException("Prescription not found");
                });

        log.debug("Found prescription with ID: {}", prescriptionId);
        return prescription;
    }

    @Transactional(readOnly = true)
    public Prescription findByPrescriptionNumber(String prescriptionNumber) {
        log.info("Fetching prescription by number: {}", prescriptionNumber);

        Prescription prescription = prescriptionRepository.findByPrescriptionNumber(prescriptionNumber)
                .orElseThrow(() -> {
                    log.warn("Prescription not found for prescription number: {}", prescriptionNumber);
                    return new ResourceNotFoundException("Prescription not found");
                });

        log.debug("Found prescription with prescription number: {}", prescriptionNumber);
        return prescription;
    }

    @Transactional(readOnly = true)
    public Prescription findByFacilityIdAndPrescriptionNumber(UUID facilityId, String prescriptionNumber) {
        log.info("Fetching prescription by facility: {} and number: {}", facilityId, prescriptionNumber);

        Prescription prescription = prescriptionRepository
                .findByFacilityIdAndPrescriptionNumber(facilityId, prescriptionNumber)
                .orElseThrow(() -> {
                    log.warn("Prescription not found for facility: {} and prescription number: {}", facilityId,
                            prescriptionNumber);
                    return new ResourceNotFoundException("Prescription not found or not accessible by this facility");
                });

        log.debug("Found prescription with facility: {} and prescription number: {}", facilityId, prescriptionNumber);
        return prescription;
    }

    @Transactional(readOnly = true)
    public Page<Prescription> findByPatientId(UUID patientId, Pageable pageable) {
        log.info("Fetching prescriptions for patient: {}", patientId);

        Page<Prescription> prescriptionPage = prescriptionRepository.findByPatientId(patientId, pageable);
        log.debug("Found {} prescriptions for patient: {}", prescriptionPage.getTotalElements(), patientId);
        return prescriptionPage;
    }

    @Transactional(readOnly = true)
    public Page<Prescription> findByDoctorId(UUID doctorId, Pageable pageable) {
        log.info("Fetching prescriptions by doctor: {}", doctorId);

        Page<Prescription> prescriptions = prescriptionRepository.findByDoctorId(doctorId, pageable);
        log.debug("Found {} prescriptions for doctor: {}", prescriptions.getTotalElements(), doctorId);
        return prescriptions;
    }

    @Transactional(readOnly = true)
    public Page<Prescription> findByFacilityId(UUID facilityId, Pageable pageable) {
        log.info("Fetching prescriptions by facility: {}", facilityId);

        Page<Prescription> prescriptions = prescriptionRepository.findByFacilityId(facilityId, pageable);
        log.debug("Found {} prescriptions for facility: {}", prescriptions.getTotalElements(), facilityId);
        return prescriptions;
    }

    @Transactional(readOnly = true)
    public Page<Prescription> findByPharmacistId(UUID pharmacistId, Pageable pageable) {
        log.info("Fetching prescriptions by pharmacist: {}", pharmacistId);

        Page<Prescription> prescriptions = prescriptionRepository.findByPharmacistId(pharmacistId, pageable);
        log.debug("Found {} prescriptions for pharmacist: {}", prescriptions.getTotalElements(), pharmacistId);
        return prescriptions;
    }

    @Transactional(readOnly = true)
    public Page<Prescription> findByStatus(PrescriptionStatus status, Pageable pageable) {
        log.info("Fetching prescriptions by status: {}", status);

        Page<Prescription> prescriptions = prescriptionRepository.findByStatus(status, pageable);
        log.debug("Found {} prescriptions with status: {}", prescriptions.getTotalElements(), status);
        return prescriptions;
    }

    @Transactional
    public Prescription createPrescription(Account account, CreatePrescriptionRequestDto request) throws AppException {
        log.info("Creating prescription for appointment: {}", request.appointmentId());

        // Check if appointment exists and is completed
        Appointment appointment = appointmentService.findById(request.appointmentId());
        if (appointment.getStatus() != AppointmentStatus.COMPLETED) {
            throw new AppException("Appointment is not completed");
        }

        // Check if account is authorized to create prescription
        if (!appointment.getDoctor().getAccount().getId().equals(account.getId())) {
            throw new AppException("Not authorized to create prescription for this appointment");
        }

        // Check if prescription already exists for this appointment
        if (prescriptionRepository.existsByAppointmentId(request.appointmentId())) {
            throw new AppException("Prescription already exists for this appointment");
        }

        try {
            // Create a prescription record
            Prescription prescription = Prescription.builder()
                    .appointment(appointment)
                    .doctor(appointment.getDoctor())
                    .patient(appointment.getPatient())
                    .facility(appointment.getDoctor().getFacility())
                    .diagnosis(request.diagnosis())
                    .notes(request.notes())
                    .instructions(request.instructions())
                    .status(PrescriptionStatus.CREATED)
                    .build();

            // Save prescription
            prescription = prescriptionRepository.save(prescription);

            // Create prescription items
            Prescription finalPrescription = prescription;
            request.prescriptionItems()
                    .forEach(itemRequest -> {
                        PrescriptionItem item = PrescriptionItem.builder()
                                .prescription(finalPrescription)
                                .medicationName(itemRequest.medicationName())
                                .genericName(itemRequest.genericName())
                                .dosageForm(itemRequest.dosageForm())
                                .strength(itemRequest.strength())
                                .quantity(itemRequest.quantity())
                                .instructions(itemRequest.instructions())
                                .frequency(itemRequest.frequency())
                                .duration(itemRequest.duration())
                                .notes(itemRequest.notes())
                                .build();
                        prescriptionItemRepository.save(item);
                    });

            // Notify patient
            PrescriptionCreatedEvent event = new PrescriptionCreatedEvent(prescription);
            applicationEventPublisher.publishEvent(event);

            log.info("Prescription created successfully: {} with status: {}", prescription.getPrescriptionNumber(),
                    PrescriptionStatus.CREATED);

            return prescription;
        } catch (Exception e) {
            log.error("Error creating prescription for appointment ID: {}", request.appointmentId(), e);
            throw new AppException("Error creating prescription");
        }
    }

    @Transactional
    public void markAsReadyForProcessing(UUID prescriptionId, Account patientAccount) throws AppException {
        log.info("Marking prescription as ready for processing: {}", prescriptionId);

        // Find prescription by ID
        Prescription prescription = findById(prescriptionId);

        // Verify if the patient owns this prescription
        if (!prescription.getPatient().getAccount().getId().equals(patientAccount.getId())) {
            throw new AppException("Not authorized to modify this prescription");
        }

        // Validate current status
        if (prescription.getStatus() != PrescriptionStatus.CREATED) {
            throw new AppException("Prescription is not in CREATED status");
        }

        try {
            prescription.setStatus(PrescriptionStatus.READY_FOR_PROCESSING);
            prescriptionRepository.save(prescription);

            log.info("Prescription {} marked as ready for processing", prescriptionId);
        } catch (Exception e) {
            log.error("Failed to mark prescription as ready for processing: {}", prescriptionId, e);
            throw new AppException("Failed to mark prescription as ready for processing");
        }
    }

    @Transactional
    public void startProcessing(UUID prescriptionId, Account pharmacistAccount) throws AppException {
        log.info("Pharmacist starting to process prescription: {}", prescriptionId);

        // Find pharmacist by Account
        Pharmacist pharmacist = pharmacistService.findByAccount(pharmacistAccount);

        // Find the prescription by ID
        Prescription prescription = findById(prescriptionId);

        // Verify if the pharmacist facility matches prescription facility
        if (!prescription.getFacility().getId().equals(pharmacist.getFacility().getId())) {
            throw new AppException("Not authorized to process this prescription");
        }

        // Verify if the prescription is already processed by another pharmacist
        if (prescription.getPharmacist() != null && !prescription.getPharmacist().getId().equals(pharmacist.getId())) {
            throw new AppException("Prescription already processed by another pharmacist");
        }

        // Validate current status
        if (prescription.getStatus() != PrescriptionStatus.READY_FOR_PROCESSING) {
            throw new AppException("Prescription is not ready for processing");
        }

        try {
            // Update prescription
            prescription.setStatus(PrescriptionStatus.PROCESSING);
            prescription.setPharmacist(pharmacist);

            // Save prescription
            prescriptionRepository.save(prescription);

            log.info("Prescription processing started by pharmacist: {} -> {}", prescriptionId,
                    prescription.getStatus());
        } catch (Exception e) {
            log.error("Failed to start processing prescription: {}", prescriptionId, e);
            throw new AppException("Failed to start processing prescription");
        }
    }

    @Transactional
    public void markAsCompleted(UUID prescriptionId, Account pharmacistAccount) throws AppException {
        log.info("Pharmacist completing prescription: {}", prescriptionId);

        // Find pharmacist by Account
        Pharmacist pharmacist = pharmacistService.findByAccount(pharmacistAccount);

        // Find the prescription by ID
        Prescription prescription = findById(prescriptionId);

        // Verify if the pharmacist facility matches prescription facility
        if (!prescription.getFacility().getId().equals(pharmacist.getFacility().getId())) {
            throw new AppException("Not authorized to complete this prescription");
        }

        // Verify if the prescription is being processed by the same pharmacist
        if (prescription.getPharmacist() == null || !prescription.getPharmacist().getId().equals(pharmacist.getId())) {
            throw new AppException("Prescription not being processed by this pharmacist");
        }

        // Validate current status
        if (prescription.getStatus() != PrescriptionStatus.PROCESSING) {
            throw new AppException("Prescription is not in processing status");
        }

        try {
            // Update prescription to completed
            prescription.setStatus(PrescriptionStatus.COMPLETED);

            // Save prescription
            prescriptionRepository.save(prescription);

            log.info("Prescription completed by pharmacist: {} -> {}", prescriptionId, prescription.getStatus());
        } catch (Exception e) {
            log.error("Failed to complete prescription: {}", prescriptionId, e);
            throw new AppException("Failed to complete prescription");
        }
    }

    @Transactional
    public void markAsExpired(UUID prescriptionId) throws AppException {
        log.info("Marking prescription as expired: {}", prescriptionId);

        Prescription prescription = findById(prescriptionId);

        if (prescription.getStatus() == PrescriptionStatus.COMPLETED ||
                prescription.getStatus() == PrescriptionStatus.CANCELLED) {
            throw new AppException("Cannot expire a completed or cancelled prescription");
        }

        try {
            prescription.setStatus(PrescriptionStatus.EXPIRED);
            prescriptionRepository.save(prescription);

            log.info("Prescription marked as expired: {}", prescriptionId);
        } catch (Exception e) {
            log.error("Failed to mark prescription as expired: {}", prescriptionId, e);
            throw new AppException("Failed to mark prescription as expired");
        }
    }

    @Transactional
    public void cancelPrescription(UUID prescriptionId, String reason) throws AppException {
        log.info("Cancelling prescription: {} with reason: {}", prescriptionId, reason);

        Prescription prescription = findById(prescriptionId);

        if (prescription.getStatus() == PrescriptionStatus.COMPLETED) {
            throw new AppException("Cannot cancel a completed prescription");
        }

        try {
            prescription.setStatus(PrescriptionStatus.CANCELLED);
            prescriptionRepository.save(prescription);

            log.info("Prescription cancelled: {}", prescriptionId);
        } catch (Exception e) {
            log.error("Failed to cancel prescription: {}", prescriptionId, e);
            throw new AppException("Failed to cancel prescription");
        }
    }
}
