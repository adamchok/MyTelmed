package com.mytelmed.core.delivery.service;

import com.mytelmed.common.advice.AppException;
import com.mytelmed.common.advice.exception.ResourceNotFoundException;
import com.mytelmed.common.constant.delivery.DeliveryMethod;
import com.mytelmed.common.constant.delivery.DeliveryStatus;
import com.mytelmed.common.constant.family.FamilyPermissionType;
import com.mytelmed.common.event.delivery.model.DeliveryCompletedEvent;
import com.mytelmed.common.event.delivery.model.DeliveryCreatedEvent;
import com.mytelmed.common.event.delivery.model.DeliveryOutForDeliveryEvent;
import com.mytelmed.core.address.entity.Address;
import com.mytelmed.core.address.service.AddressService;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.delivery.entity.MedicationDelivery;
import com.mytelmed.core.delivery.repository.MedicationDeliveryRepository;
import com.mytelmed.core.delivery.strategy.DeliveryHandler;
import com.mytelmed.core.delivery.strategy.impl.HomeDeliveryHandler;
import com.mytelmed.core.family.service.FamilyMemberPermissionService;
import com.mytelmed.core.pharmacist.entity.Pharmacist;
import com.mytelmed.core.pharmacist.service.PharmacistService;
import com.mytelmed.core.prescription.entity.Prescription;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Service for managing medication delivery operations in Malaysian public
 * healthcare telemedicine.
 * Uses Strategy Pattern for handling different delivery methods (pickup vs home
 * delivery).
 */
@Slf4j
@Service
public class MedicationDeliveryService {

  private final MedicationDeliveryRepository deliveryRepository;
  private final AddressService addressService;
  private final PharmacistService pharmacistService;
  private final ApplicationEventPublisher applicationEventPublisher;
  private final FamilyMemberPermissionService familyPermissionService;
  private final Map<DeliveryMethod, DeliveryHandler> deliveryHandlers;

  public MedicationDeliveryService(MedicationDeliveryRepository deliveryRepository,
      AddressService addressService,
      PharmacistService pharmacistService,
      ApplicationEventPublisher applicationEventPublisher,
      FamilyMemberPermissionService familyPermissionService,
      List<DeliveryHandler> deliveryHandlers) {
    this.deliveryRepository = deliveryRepository;
    this.addressService = addressService;
    this.pharmacistService = pharmacistService;
    this.applicationEventPublisher = applicationEventPublisher;
    this.familyPermissionService = familyPermissionService;
    this.deliveryHandlers = deliveryHandlers.stream()
        .collect(Collectors.toMap(DeliveryHandler::getSupportedDeliveryMethod, Function.identity()));
  }

  @Transactional(readOnly = true)
  public MedicationDelivery findById(UUID deliveryId) {
    log.info("Finding delivery by ID: {}", deliveryId);

    return deliveryRepository.findById(deliveryId)
        .orElseThrow(() -> {
          log.warn("Delivery not found for ID: {}", deliveryId);
          return new ResourceNotFoundException("Delivery not found");
        });
  }

  @Transactional(readOnly = true)
  public MedicationDelivery findByPrescriptionId(UUID prescriptionId) {
    log.info("Finding delivery by prescription ID: {}", prescriptionId);

    return deliveryRepository.findByPrescriptionId(prescriptionId)
        .orElseThrow(() -> {
          log.warn("Delivery not found for prescription ID: {}", prescriptionId);
          return new ResourceNotFoundException("Delivery not found for prescription");
        });
  }

  @Transactional(readOnly = true)
  public Page<MedicationDelivery> findByPatientId(UUID patientId, Pageable pageable) {
    log.info("Finding deliveries for patient: {}", patientId);
    return deliveryRepository.findByPatientId(patientId, pageable);
  }

  @Transactional(readOnly = true)
  public Page<MedicationDelivery> findByFacilityId(UUID facilityId, Pageable pageable) {
    log.info("Finding deliveries for facility: {}", facilityId);
    return deliveryRepository.findByFacilityId(facilityId, pageable);
  }

  @Transactional(readOnly = true)
  public Page<MedicationDelivery> findByStatus(DeliveryStatus status, Pageable pageable) {
    log.info("Finding deliveries by status: {}", status);
    return deliveryRepository.findByStatus(status, pageable);
  }

  @PreAuthorize("hasRole('PATIENT')")
  @Transactional
  public MedicationDelivery choosePickup(UUID prescriptionId, Account patientAccount) {
    log.info("Patient choosing pickup for prescription: {}", prescriptionId);

    MedicationDelivery delivery = initializeDelivery(prescriptionId, patientAccount, DeliveryMethod.PICKUP, null);

    // Publish delivery created event
    DeliveryCreatedEvent event = new DeliveryCreatedEvent(delivery);
    applicationEventPublisher.publishEvent(event);

    return delivery;
  }

  @PreAuthorize("hasRole('PATIENT')")
  @Transactional
  public MedicationDelivery chooseHomeDelivery(UUID prescriptionId, Account patientAccount, UUID addressId) {
    log.info("Patient choosing home delivery for prescription: {} to address: {}", prescriptionId, addressId);

    Address deliveryAddress = addressService.findAddressById(addressId);
    MedicationDelivery delivery = initializeDelivery(prescriptionId, patientAccount, DeliveryMethod.HOME_DELIVERY,
        deliveryAddress);

    // Publish delivery created event
    DeliveryCreatedEvent event = new DeliveryCreatedEvent(delivery);
    applicationEventPublisher.publishEvent(event);

    return delivery;
  }

  @PreAuthorize("hasRole('PATIENT')")
  @Transactional
  public void processPayment(UUID deliveryId, Account account) {
    log.info("Processing payment for delivery: {}", deliveryId);

    MedicationDelivery delivery = findById(deliveryId);
    UUID patientId = delivery.getPrescription().getPatient().getId();

    // Get the patient ID this account is authorized to access
    UUID authorizedPatientId = familyPermissionService.getAuthorizedPatientId(account);
    if (authorizedPatientId == null) {
      throw new AppException("Account is not authorized to process payments for any patient");
    }

    // Verify the delivery belongs to the authorized patient
    if (!patientId.equals(authorizedPatientId)) {
      throw new AppException("Not authorized to process payment for this delivery");
    }

    // Verify the account has BOOK_APPOINTMENT permission (required for payment)
    if (!familyPermissionService.hasPermission(account, patientId, FamilyPermissionType.BOOK_APPOINTMENT)) {
      throw new AppException("Insufficient permissions to process payments");
    }

    if (delivery.getStatus() != DeliveryStatus.PENDING_PAYMENT) {
      throw new AppException("Delivery is not pending payment");
    }

    // Note: Actual payment processing is handled by PaymentService
    // This method is called after successful payment confirmation
    delivery.setStatus(DeliveryStatus.PAID);
    deliveryRepository.save(delivery);

    log.info("Payment processed successfully for delivery: {}", deliveryId);
  }

  @PreAuthorize("hasRole('PHARMACIST')")
  @Transactional
  public void processDelivery(UUID deliveryId, Account pharmacistAccount) {
    log.info("Pharmacist processing delivery: {}", deliveryId);

    Pharmacist pharmacist = pharmacistService.findByAccount(pharmacistAccount);
    MedicationDelivery delivery = findById(deliveryId);

    // Verify pharmacist facility matches prescription facility
    if (!delivery.getPrescription().getFacility().getId().equals(pharmacist.getFacility().getId())) {
      throw new AppException("Not authorized to process this delivery");
    }

    DeliveryHandler handler = getDeliveryHandler(delivery.getDeliveryMethod());
    handler.processDelivery(delivery);

    deliveryRepository.save(delivery);
    log.info("Delivery {} processed by pharmacist", deliveryId);
  }

  @PreAuthorize("hasRole('PHARMACIST')")
  @Transactional
  public void markOutForDelivery(UUID deliveryId, Account pharmacistAccount, String courierName,
      String trackingReference, String contactPhone) {
    log.info("Marking delivery {} as out for delivery", deliveryId);

    Pharmacist pharmacist = pharmacistService.findByAccount(pharmacistAccount);
    MedicationDelivery delivery = findById(deliveryId);

    // Verify pharmacist facility matches prescription facility
    if (!delivery.getPrescription().getFacility().getId().equals(pharmacist.getFacility().getId())) {
      throw new AppException("Not authorized to process this delivery");
    }

    if (delivery.getDeliveryMethod() != DeliveryMethod.HOME_DELIVERY) {
      throw new AppException("Only home deliveries can be marked out for delivery");
    }

    HomeDeliveryHandler homeHandler = (HomeDeliveryHandler) getDeliveryHandler(DeliveryMethod.HOME_DELIVERY);
    homeHandler.markOutForDelivery(delivery, courierName, trackingReference, contactPhone);

    deliveryRepository.save(delivery);

    // Publish out for delivery event
    DeliveryOutForDeliveryEvent event = new DeliveryOutForDeliveryEvent(delivery);
    applicationEventPublisher.publishEvent(event);

    log.info("Delivery {} marked as out for delivery", deliveryId);
  }

  @PreAuthorize("hasRole('PATIENT')")
  @Transactional
  public void markAsCompleted(UUID deliveryId, Account account) {
    log.info("Patient marking delivery {} as completed", deliveryId);

    MedicationDelivery delivery = findById(deliveryId);
    UUID patientId = delivery.getPrescription().getPatient().getId();

    // Get the patient ID this account is authorized to access
    UUID authorizedPatientId = familyPermissionService.getAuthorizedPatientId(account);
    if (authorizedPatientId == null) {
      throw new AppException("Account is not authorized to complete deliveries for any patient");
    }

    // Verify the delivery belongs to the authorized patient
    if (!patientId.equals(authorizedPatientId)) {
      throw new AppException("Not authorized to complete this delivery");
    }

    // Verify the account has VIEW_APPOINTMENT permission (minimum required)
    if (!familyPermissionService.hasPermission(account, patientId, FamilyPermissionType.VIEW_APPOINTMENT)) {
      throw new AppException("Insufficient permissions to complete deliveries");
    }

    DeliveryHandler handler = getDeliveryHandler(delivery.getDeliveryMethod());
    handler.completeDelivery(delivery);

    deliveryRepository.save(delivery);

    // Publish delivery completed event
    DeliveryCompletedEvent event = new DeliveryCompletedEvent(delivery);
    applicationEventPublisher.publishEvent(event);

    log.info("Delivery {} marked as completed", deliveryId);
  }

  @Transactional
  public void cancelDelivery(UUID deliveryId, String reason) {
    log.info("Cancelling delivery: {} with reason: {}", deliveryId, reason);

    MedicationDelivery delivery = findById(deliveryId);

    DeliveryHandler handler = getDeliveryHandler(delivery.getDeliveryMethod());
    handler.cancelDelivery(delivery, reason);

    deliveryRepository.save(delivery);
    log.info("Delivery {} cancelled", deliveryId);
  }

  // Private helper methods

  private MedicationDelivery initializeDelivery(UUID prescriptionId, Account patientAccount,
      DeliveryMethod deliveryMethod, Address deliveryAddress) {
    // Verify prescription exists and patient owns it
    // This would require prescription service injection, simplified for this
    // example

    if (deliveryRepository.existsByPrescriptionId(prescriptionId)) {
      throw new AppException("Delivery already exists for this prescription");
    }

    // Create a mock prescription for this example - in real implementation would
    // fetch from service
    Prescription prescription = new Prescription();
    prescription.setId(prescriptionId);

    DeliveryHandler handler = getDeliveryHandler(deliveryMethod);
    MedicationDelivery delivery = handler.initializeDelivery(prescription);

    if (deliveryAddress != null) {
      delivery.setDeliveryAddress(deliveryAddress);
    }

    return deliveryRepository.save(delivery);
  }

  private DeliveryHandler getDeliveryHandler(DeliveryMethod deliveryMethod) {
    DeliveryHandler handler = deliveryHandlers.get(deliveryMethod);
    if (handler == null) {
      throw new AppException("No handler available for delivery method: " + deliveryMethod);
    }
    return handler;
  }
}