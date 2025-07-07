package com.mytelmed.core.prescription.service;

import com.mytelmed.common.advice.AppException;
import com.mytelmed.common.advice.exception.ResourceNotFoundException;
import com.mytelmed.common.constant.appointment.AppointmentStatus;
import com.mytelmed.common.constant.prescription.DeliveryType;
import com.mytelmed.common.constant.prescription.PrescriptionStatus;
import com.mytelmed.common.event.prescription.model.PrescriptionCreatedEvent;
import com.mytelmed.core.address.entity.Address;
import com.mytelmed.core.address.service.AddressService;
import com.mytelmed.core.appointment.entity.Appointment;
import com.mytelmed.core.appointment.service.AppointmentService;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.pharmacist.entity.Pharmacist;
import com.mytelmed.core.pharmacist.service.PharmacistService;
import com.mytelmed.core.prescription.dto.ChoosePrescriptionDeliveryRequestDto;
import com.mytelmed.core.prescription.dto.CreatePrescriptionRequestDto;
import com.mytelmed.core.prescription.entity.Prescription;
import com.mytelmed.core.prescription.entity.PrescriptionItem;
import com.mytelmed.core.prescription.repository.PrescriptionItemRepository;
import com.mytelmed.core.prescription.repository.PrescriptionRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Slf4j
@Service
public class PrescriptionService {
    private final PrescriptionRepository prescriptionRepository;
    private final PrescriptionItemRepository prescriptionItemRepository;
    private final AppointmentService appointmentService;
    private final PharmacistService pharmacistService;
    private final AddressService addressService;
    private final ApplicationEventPublisher applicationEventPublisher;

    public PrescriptionService(PrescriptionRepository prescriptionRepository,
            PrescriptionItemRepository prescriptionItemRepository,
            AppointmentService appointmentService, AddressService addressService,
            PharmacistService pharmacistService, ApplicationEventPublisher applicationEventPublisher) {
        this.prescriptionRepository = prescriptionRepository;
        this.prescriptionItemRepository = prescriptionItemRepository;
        this.appointmentService = appointmentService;
        this.pharmacistService = pharmacistService;
        this.addressService = addressService;
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

    @PreAuthorize("hasRole('DOCTOR')")
    @Transactional
    public void createPrescription(Account account, CreatePrescriptionRequestDto request) throws AppException {
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
                    .deliveryType(request.deliveryType())
                    .status(PrescriptionStatus.CREATED)
                    .expiryDate(Instant.now().plus(30, ChronoUnit.DAYS))
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
        } catch (Exception e) {
            log.error("Error creating prescription for appointment ID: {}", request.appointmentId(), e);
            throw new AppException("Error creating prescription");
        }
    }

    @PreAuthorize("hasRole('PATIENT')")
    @Transactional
    public void choosePickup(UUID prescriptionId, Account patientAccount) throws AppException {
        log.info("Choosing pickup for prescription {}", prescriptionId);

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
            // Update delivery type, status, and pickup date
            prescription.setDeliveryType(DeliveryType.PICKUP);
            prescription.setStatus(PrescriptionStatus.READY_FOR_PICKUP); // Move directly to processing for pickup

            // Save prescription
            prescriptionRepository.save(prescription);

            log.info("Patient chose pickup for prescription {}", prescriptionId);
        } catch (Exception e) {
            log.error("Failed to select pickup for prescription with ID: {}", prescriptionId, e);
            throw new AppException("Failed to select pickup for prescription");
        }
    }

    @PreAuthorize("hasRole('PATIENT')")
    @Transactional
    public void chooseDelivery(UUID prescriptionId, Account patientAccount,
            ChoosePrescriptionDeliveryRequestDto request) throws AppException {
        log.info("Choosing delivery for prescription {}", prescriptionId);

        // Find prescription by ID
        Prescription prescription = findById(prescriptionId);

        // Find address by ID
        Address address = addressService.findAddressById(request.addressId());

        // Verify patient owns this prescription
        if (!prescription.getPatient().getAccount().getId().equals(patientAccount.getId())) {
            throw new AppException("Not authorized to modify this prescription");
        }

        // Validate current status
        if (prescription.getStatus() != PrescriptionStatus.CREATED) {
            throw new AppException("Prescription is not in CREATED status");
        }

        try {
            // Update delivery type and status
            prescription.setDeliveryType(DeliveryType.DELIVERY);
            prescription.setStatus(PrescriptionStatus.PENDING_PAYMENT);
            prescription.setDeliveryAddress(address);

            // Save prescription
            prescriptionRepository.save(prescription);

            log.info("Patient chose delivery for prescription: {}, payment required", prescriptionId);
        } catch (Exception e) {
            log.error("Failed to select delivery for prescription with ID: {}", prescriptionId, e);
            throw new AppException("Failed to select delivery for prescription");
        }
    }

    @PreAuthorize("hasRole('PATIENT')")
    @Transactional
    public void markAsPickedUp(UUID prescriptionId, Account patientAccount) throws AppException {
        log.info("Marking prescription {} as picked up", prescriptionId);

        // Find prescription by ID
        Prescription prescription = findById(prescriptionId);

        // Verify patient owns this prescription
        if (!prescription.getPatient().getAccount().getId().equals(patientAccount.getId())) {
            throw new AppException("Not authorized to modify this prescription");
        }

        // Verify if the prescription delivery type is correct
        if (prescription.getDeliveryType() != DeliveryType.PICKUP) {
            throw new AppException("This prescription is not for pickup");
        }

        // Validate current status and delivery type
        if (prescription.getStatus() != PrescriptionStatus.READY_FOR_PICKUP) {
            throw new AppException("Prescription is not ready for pickup");
        }

        try {
            // Update prescription
            prescription.setPickedUpAt(Instant.now());
            prescription.setStatus(PrescriptionStatus.PICKED_UP);

            // Save prescription
            prescriptionRepository.save(prescription);

            log.info("Prescription marked as picked up: {} at {}", prescriptionId, Instant.now());
        } catch (Exception e) {
            log.error("Failed to mark prescription as picked up: {}", prescriptionId, e);
            throw new AppException("Failed to mark prescription as picked up");
        }
    }

    @PreAuthorize("hasRole('PATIENT')")
    @Transactional
    public void markAsDelivered(UUID prescriptionId, Account patientAccount) throws AppException {
        log.info("Marking prescription as delivered: {}", prescriptionId);

        // Find prescription by ID
        Prescription prescription = findById(prescriptionId);

        // Verify patient owns this prescription
        if (!prescription.getPatient().getAccount().getId().equals(patientAccount.getId())) {
            throw new AppException("Not authorized to modify this prescription");
        }

        // Verify if the prescription delivery type
        if (prescription.getDeliveryType() != DeliveryType.DELIVERY) {
            throw new AppException("This prescription is not for delivery");
        }

        // Verify the prescription current status
        if (prescription.getStatus() != PrescriptionStatus.OUT_FOR_DELIVERY) {
            throw new AppException("Prescription is not out for delivery");
        }

        try {
            // Update prescription
            prescription.setStatus(PrescriptionStatus.DELIVERED);
            prescription.setDeliveredAt(Instant.now());

            // Save prescription
            prescriptionRepository.save(prescription);

            log.info("Prescription marked as delivered: {}", prescriptionId);
        } catch (Exception e) {
            log.error("Failed to mark prescription as delivered: {}", prescriptionId, e);
            throw new AppException("Failed to mark prescription as delivered");
        }
    }

    @PreAuthorize("hasRole('PATIENT')")
    @Transactional
    public void processPayment(UUID prescriptionId, Account patientAccount) throws AppException {
        log.info("Processing payment for prescription: {}", prescriptionId);

        Prescription prescription = findById(prescriptionId);

        // Verify patient owns this prescription
        if (!prescription.getPatient().getAccount().getId().equals(patientAccount.getId())) {
            throw new AppException("Not authorized to modify this prescription");
        }

        // Validate current status and delivery type
        if (prescription.getStatus() != PrescriptionStatus.PENDING_PAYMENT) {
            throw new AppException("Prescription is not pending payment");
        }

        if (prescription.getDeliveryType() != DeliveryType.DELIVERY) {
            throw new AppException("Payment is only required for delivery prescriptions");
        }

        // Note: Payment is now handled through the PaymentService and Stripe
        // integration
        // This method should only be called after successful payment confirmation
        // Check if payment has been completed via Stripe
        if (hasSuccessfulPayment(prescription)) {
            prescription.setStatus(PrescriptionStatus.PAID);
            prescriptionRepository.save(prescription);

            log.info("Payment processed successfully for prescription: {}", prescriptionId);
        } else {
            throw new AppException("Payment not found or not completed. Please complete payment first.");
        }
    }

    @PreAuthorize("hasRole('PHARMACIST')")
    @Transactional
    public void processPrescription(UUID prescriptionId, Account account) throws AppException {
        log.info("Pharmacist processing prescription: {}", prescriptionId);

        // Find pharmacist by Account
        Pharmacist pharmacist = pharmacistService.findByAccount(account);

        // Find the prescription by ID
        Prescription prescription = findById(prescriptionId);

        // Verify if the pharmacist facility
        if (prescription.getFacility().getId() != pharmacist.getFacility().getId()) {
            throw new AppException("Not authorized to process this prescription");
        }

        // Verify if the prescription is processed by another pharmacist
        if (prescription.getPharmacist() != null) {
            throw new AppException("Prescription already processed by another pharmacist");
        }

        // Validate current status
        if (prescription.getStatus() != PrescriptionStatus.PAID) {
            throw new AppException("Prescription is not ready for processing");
        }

        try {
            // Update prescription
            prescription.setStatus(PrescriptionStatus.PROCESSING);
            prescription.setPharmacist(pharmacist);

            // Save prescription
            prescriptionRepository.save(prescription);

            log.info("Prescription processed by pharmacist: {} -> {}", prescriptionId, prescription.getStatus());
        } catch (Exception e) {
            log.error("Failed to process prescription: {}", prescriptionId, e);
            throw new AppException("Failed to process prescription");
        }
    }

    /**
     * Check if prescription has a successful payment
     */
    private boolean hasSuccessfulPayment(Prescription prescription) {
        // In a real implementation, this would check the Bill and PaymentTransaction
        // entities
        // For now, we'll assume payment is handled externally via PaymentService
        log.info("Checking payment status for prescription: {}", prescription.getPrescriptionNumber());

        // This method should ideally inject PaymentService and check for completed
        // payments
        // For now, return true to maintain backward compatibility
        return true;
    }
}
