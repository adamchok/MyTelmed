package com.mytelmed.core.delivery.service;

import com.mytelmed.common.advice.AppException;
import com.mytelmed.common.advice.exception.ResourceNotFoundException;
import com.mytelmed.common.constant.delivery.DeliveryMethod;
import com.mytelmed.common.constant.delivery.DeliveryStatus;
import com.mytelmed.common.constant.family.FamilyPermissionType;
import com.mytelmed.common.event.delivery.model.DeliveryCancelledEvent;
import com.mytelmed.common.event.delivery.model.DeliveryCompletedEvent;
import com.mytelmed.common.event.delivery.model.DeliveryCreatedEvent;
import com.mytelmed.common.event.delivery.model.DeliveryOutForDeliveryEvent;
import com.mytelmed.common.event.delivery.model.DeliveryPaymentConfirmedEvent;
import com.mytelmed.common.event.delivery.model.DeliveryProcessingStartedEvent;
import com.mytelmed.common.event.delivery.model.DeliveryReadyForPickupEvent;
import com.mytelmed.core.address.entity.Address;
import com.mytelmed.core.address.service.AddressService;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.delivery.entity.MedicationDelivery;
import com.mytelmed.core.delivery.repository.MedicationDeliveryRepository;
import com.mytelmed.core.delivery.strategy.DeliveryHandler;
import com.mytelmed.core.delivery.strategy.impl.HomeDeliveryHandler;
import com.mytelmed.core.delivery.strategy.impl.PickupDeliveryHandler;
import com.mytelmed.core.family.service.FamilyMemberPermissionService;
import com.mytelmed.core.payment.service.PaymentRefundService;
import com.mytelmed.core.pharmacist.entity.Pharmacist;
import com.mytelmed.core.pharmacist.service.PharmacistService;
import com.mytelmed.core.prescription.entity.Prescription;
import com.mytelmed.core.prescription.service.PrescriptionService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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
    private final Map<DeliveryMethod, DeliveryHandler> deliveryHandlers;
    private final PrescriptionService prescriptionService;
    private final FamilyMemberPermissionService familyMemberPermissionService;
    private final PaymentRefundService paymentRefundService;

    public MedicationDeliveryService(MedicationDeliveryRepository deliveryRepository,
            AddressService addressService,
            PharmacistService pharmacistService,
            ApplicationEventPublisher applicationEventPublisher,
            List<DeliveryHandler> deliveryHandlers, PrescriptionService prescriptionService,
            FamilyMemberPermissionService familyMemberPermissionService,
            PaymentRefundService paymentRefundService) {
        this.deliveryRepository = deliveryRepository;
        this.addressService = addressService;
        this.pharmacistService = pharmacistService;
        this.applicationEventPublisher = applicationEventPublisher;
        this.deliveryHandlers = deliveryHandlers.stream()
                .collect(Collectors.toMap(DeliveryHandler::getSupportedDeliveryMethod, Function.identity()));
        this.prescriptionService = prescriptionService;
        this.familyMemberPermissionService = familyMemberPermissionService;
        this.paymentRefundService = paymentRefundService;
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
    public Page<MedicationDelivery> findByPatientId(UUID patientId, int page, int size) {
        log.info("Finding deliveries for patient: {}", patientId);

        Pageable pageable = PageRequest.of(page, size);
        return deliveryRepository.findByPatientId(patientId, pageable);
    }

    @Transactional(readOnly = true)
    public Page<MedicationDelivery> findByPatientAccount(Account account, int page, int size) {
        log.info("Finding deliveries for patient account with ID: {}", account.getId());

        Pageable pageable = PageRequest.of(page, size);
        return deliveryRepository.findByPrescriptionPatientAccount(account, pageable);
    }

    @Transactional(readOnly = true)
    public Page<MedicationDelivery> findByFacilityId(UUID facilityId, Pageable pageable) {
        log.info("Finding deliveries for facility: {}", facilityId);
        return deliveryRepository.findByFacilityId(facilityId, pageable);
    }

    @Transactional
    public MedicationDelivery choosePickup(UUID prescriptionId, Account patientAccount) {
        log.info("Patient choosing pickup for prescription: {}", prescriptionId);

        MedicationDelivery delivery = initializeDelivery(prescriptionId, patientAccount, DeliveryMethod.PICKUP, null);

        // Publish delivery created event
        DeliveryCreatedEvent event = new DeliveryCreatedEvent(delivery);
        applicationEventPublisher.publishEvent(event);

        return delivery;
    }

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

    @Transactional
    public void processPayment(UUID deliveryId, Account account) {
        log.info("Processing payment for delivery: {}", deliveryId);

        MedicationDelivery delivery = findById(deliveryId);
        UUID patientId = delivery.getPrescription().getPatient().getId();

        // Get all patient IDs this account is authorized to access
        List<UUID> authorizedPatientIds = familyMemberPermissionService.getAuthorizedPatientIds(account);
        if (authorizedPatientIds.isEmpty()) {
            throw new AppException("Account is not authorized to process payments for any patient");
        }

        // Verify the delivery belongs to one of the authorized patients
        if (!authorizedPatientIds.contains(patientId)) {
            throw new AppException("Not authorized to process payment for this delivery");
        }

        // Verify the account has billing management permission (required for payment)
        if (!familyMemberPermissionService.hasPermission(account, patientId, FamilyPermissionType.MANAGE_BILLING)) {
            throw new AppException("Insufficient permissions to process payments");
        }

        if (delivery.getStatus() != DeliveryStatus.PENDING_PAYMENT) {
            throw new AppException("Delivery is not pending payment");
        }

        // Note: Actual payment processing is handled by PaymentService
        // This method is called after successful payment confirmation
        delivery.setStatus(DeliveryStatus.PAID);
        deliveryRepository.save(delivery);

        // Publish payment confirmed event
        DeliveryPaymentConfirmedEvent event = new DeliveryPaymentConfirmedEvent(delivery);
        applicationEventPublisher.publishEvent(event);

        log.info("Payment processed successfully for delivery: {}", deliveryId);
    }

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

        // Publish delivery processing started event
        DeliveryProcessingStartedEvent processingEvent = new DeliveryProcessingStartedEvent(delivery);
        applicationEventPublisher.publishEvent(processingEvent);

        // For pickup deliveries, also publish ready for pickup event
        if (delivery.getDeliveryMethod() == DeliveryMethod.PICKUP) {
            DeliveryReadyForPickupEvent readyEvent = new DeliveryReadyForPickupEvent(delivery);
            applicationEventPublisher.publishEvent(readyEvent);
        }

        log.info("Delivery {} processed by pharmacist", deliveryId);
    }

    /**
     * Marks pickup delivery as ready for pickup by patient
     */
    @Transactional
    public void markReadyForPickup(UUID deliveryId, Account pharmacistAccount) {
        log.info("Marking pickup delivery {} as ready for pickup", deliveryId);

        Pharmacist pharmacist = pharmacistService.findByAccount(pharmacistAccount);
        MedicationDelivery delivery = findById(deliveryId);

        // Verify pharmacist facility matches prescription facility
        if (!delivery.getPrescription().getFacility().getId().equals(pharmacist.getFacility().getId())) {
            throw new AppException("Not authorized to mark this delivery as ready for pickup");
        }

        if (delivery.getDeliveryMethod() != DeliveryMethod.PICKUP) {
            throw new AppException("Only pickup deliveries can be marked as ready for pickup");
        }

        PickupDeliveryHandler pickupHandler = (PickupDeliveryHandler) getDeliveryHandler(DeliveryMethod.PICKUP);
        pickupHandler.markReadyForPickup(delivery);

        deliveryRepository.save(delivery);

        // Publish ready for pickup event
        DeliveryReadyForPickupEvent readyEvent = new DeliveryReadyForPickupEvent(delivery);
        applicationEventPublisher.publishEvent(readyEvent);

        log.info("Pickup delivery {} marked as ready for pickup", deliveryId);
    }

    /**
     * Pharmacist marks pickup delivery as delivered (completed)
     */
    @Transactional
    public void markAsDeliveredByPharmacist(UUID deliveryId, Account pharmacistAccount) {
        log.info("Pharmacist marking pickup delivery {} as delivered", deliveryId);

        Pharmacist pharmacist = pharmacistService.findByAccount(pharmacistAccount);
        MedicationDelivery delivery = findById(deliveryId);

        // Verify pharmacist facility matches prescription facility
        if (!delivery.getPrescription().getFacility().getId().equals(pharmacist.getFacility().getId())) {
            throw new AppException("Not authorized to mark this delivery as delivered");
        }

        if (delivery.getDeliveryMethod() != DeliveryMethod.PICKUP) {
            throw new AppException("Only pickup deliveries can be marked as delivered by pharmacist");
        }

        if (delivery.getStatus() != DeliveryStatus.READY_FOR_PICKUP) {
            throw new AppException("Pickup delivery must be in READY_FOR_PICKUP status to mark as delivered");
        }

        PickupDeliveryHandler pickupHandler = (PickupDeliveryHandler) getDeliveryHandler(DeliveryMethod.PICKUP);
        pickupHandler.completeDelivery(delivery);

        deliveryRepository.save(delivery);

        // Publish delivery completed event
        DeliveryCompletedEvent event = new DeliveryCompletedEvent(delivery);
        applicationEventPublisher.publishEvent(event);

        log.info("Pickup delivery {} marked as delivered by pharmacist", deliveryId);
    }

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

    @Transactional
    public void markAsCompleted(UUID deliveryId, Account account) {
        log.info("Patient marking delivery {} as completed", deliveryId);

        MedicationDelivery delivery = findById(deliveryId);
        UUID patientId = delivery.getPrescription().getPatient().getId();

        // Get all patient IDs this account is authorized to access
        List<UUID> authorizedPatientIds = familyMemberPermissionService.getAuthorizedPatientIds(account);
        if (authorizedPatientIds.isEmpty()) {
            throw new AppException("Account is not authorized to complete deliveries for any patient");
        }

        // Verify the delivery belongs to one of the authorized patients
        if (!authorizedPatientIds.contains(patientId)) {
            throw new AppException("Not authorized to complete this delivery");
        }

        // Verify the account has prescription management permission (minimum required)
        if (!familyMemberPermissionService.hasPermission(account, patientId,
                FamilyPermissionType.MANAGE_PRESCRIPTIONS)) {
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
    public void cancelDeliveryByPharmacist(UUID deliveryId, Account pharmacistAccount, String reason) {
        log.info("Pharmacist cancelling delivery: {} with reason: {}", deliveryId, reason);

        Pharmacist pharmacist = pharmacistService.findByAccount(pharmacistAccount);
        MedicationDelivery delivery = findById(deliveryId);

        // Verify pharmacist facility matches prescription facility
        if (!delivery.getPrescription().getFacility().getId().equals(pharmacist.getFacility().getId())) {
            throw new AppException("Not authorized to cancel delivery from a different facility");
        }

        // Pharmacists cannot cancel already delivered deliveries
        if (delivery.getStatus() == DeliveryStatus.DELIVERED) {
            throw new AppException("Cannot cancel already delivered medication");
        }

        // Pharmacists cannot cancel already cancelled deliveries
        if (delivery.getStatus() == DeliveryStatus.CANCELLED) {
            throw new AppException("Delivery is already cancelled");
        }

        // Handle auto-refund for home deliveries that have been paid
        if (delivery.getDeliveryMethod() == DeliveryMethod.HOME_DELIVERY &&
                delivery.getStatus() == DeliveryStatus.PAID) {
            try {
                UUID prescriptionId = delivery.getPrescription().getId();
                // Use the prescription ID to find the bill for refund processing
                paymentRefundService.processPrescriptionRefund(prescriptionId,
                        "Home delivery cancelled by pharmacist: " + reason);
                log.info("Auto-refund processed for cancelled home delivery: {}", deliveryId);
            } catch (Exception e) {
                log.error("Failed to process auto-refund for cancelled home delivery: {}", deliveryId, e);
                // Continue with cancellation even if refund fails
            }
        }

        DeliveryHandler handler = getDeliveryHandler(delivery.getDeliveryMethod());
        handler.cancelDelivery(delivery, reason);

        deliveryRepository.save(delivery);

        // Publish delivery cancelled event
        DeliveryCancelledEvent event = new DeliveryCancelledEvent(delivery, reason);
        applicationEventPublisher.publishEvent(event);

        log.info("Delivery {} cancelled by pharmacist", deliveryId);
    }

    @Transactional
    public void cancelDeliveryByPatient(UUID deliveryId, Account patientAccount, String reason) {
        log.info("Patient cancelling delivery: {} with reason: {}", deliveryId, reason);

        MedicationDelivery delivery = findById(deliveryId);
        UUID patientId = delivery.getPrescription().getPatient().getId();

        // Get all patient IDs this account is authorized to access
        List<UUID> authorizedPatientIds = familyMemberPermissionService.getAuthorizedPatientIds(patientAccount);
        if (authorizedPatientIds.isEmpty()) {
            throw new AppException("Account is not authorized to cancel deliveries for any patient");
        }

        // Verify the delivery belongs to one of the authorized patients
        if (!authorizedPatientIds.contains(patientId)) {
            throw new AppException("Not authorized to cancel this delivery");
        }

        // Verify the account has billing management permission (required for
        // cancellation with refund)
        if (!familyMemberPermissionService.hasPermission(patientAccount, patientId,
                FamilyPermissionType.MANAGE_BILLING)) {
            throw new AppException("Insufficient permissions to cancel delivery");
        }

        // Patient can only cancel home deliveries
        if (delivery.getDeliveryMethod() != DeliveryMethod.HOME_DELIVERY) {
            throw new AppException("Only home deliveries can be cancelled by patients");
        }

        // Patient cannot cancel once pharmacist starts processing (PREPARING status)
        if (delivery.getStatus() == DeliveryStatus.PREPARING ||
                delivery.getStatus() == DeliveryStatus.OUT_FOR_DELIVERY ||
                delivery.getStatus() == DeliveryStatus.DELIVERED) {
            throw new AppException("Cannot cancel delivery once pharmacist has started processing");
        }

        // Handle auto-refund for home deliveries that have been paid
        if (delivery.getStatus() == DeliveryStatus.PAID) {
            try {
                UUID prescriptionId = delivery.getPrescription().getId();
                // Use the prescription ID to find the bill for refund processing
                paymentRefundService.processPrescriptionRefund(prescriptionId,
                        "Home delivery cancelled by patient: " + reason);
                log.info("Auto-refund processed for patient cancelled home delivery: {}", deliveryId);
            } catch (Exception e) {
                log.error("Failed to process auto-refund for patient cancelled home delivery: {}", deliveryId, e);
                // Continue with cancellation even if refund fails
            }
        }

        DeliveryHandler handler = getDeliveryHandler(delivery.getDeliveryMethod());
        handler.cancelDelivery(delivery, reason);

        deliveryRepository.save(delivery);

        // Publish delivery cancelled event
        DeliveryCancelledEvent event = new DeliveryCancelledEvent(delivery, reason);
        applicationEventPublisher.publishEvent(event);

        log.info("Delivery {} cancelled by patient", deliveryId);
    }

    @Transactional(readOnly = true)
    public boolean isDeliveryCancellableByPatient(UUID deliveryId, Account patientAccount) {
        try {
            MedicationDelivery delivery = findById(deliveryId);
            UUID patientId = delivery.getPrescription().getPatient().getId();

            // Get all patient IDs this account is authorized to access
            List<UUID> authorizedPatientIds = familyMemberPermissionService.getAuthorizedPatientIds(patientAccount);
            if (authorizedPatientIds.isEmpty() || !authorizedPatientIds.contains(patientId)) {
                return false;
            }

            // Verify the account has billing management permission
            if (!familyMemberPermissionService.hasPermission(patientAccount, patientId,
                    FamilyPermissionType.MANAGE_BILLING)) {
                return false;
            }

            // Patient can only cancel home deliveries
            if (delivery.getDeliveryMethod() != DeliveryMethod.HOME_DELIVERY) {
                return false;
            }

            // Patient cannot cancel once pharmacist starts processing (PREPARING status)
            return delivery.getStatus() != DeliveryStatus.PREPARING &&
                    delivery.getStatus() != DeliveryStatus.OUT_FOR_DELIVERY &&
                    delivery.getStatus() != DeliveryStatus.DELIVERED &&
                    delivery.getStatus() != DeliveryStatus.CANCELLED;
        } catch (Exception e) {
            log.error("Error checking if delivery is cancellable by patient: {}", deliveryId, e);
            return false;
        }
    }

    @Transactional(readOnly = true)
    public boolean isDeliveryCancellableByPharmacist(UUID deliveryId, Account pharmacistAccount) {
        try {
            Pharmacist pharmacist = pharmacistService.findByAccount(pharmacistAccount);
            MedicationDelivery delivery = findById(deliveryId);

            // Verify pharmacist facility matches prescription facility
            if (!delivery.getPrescription().getFacility().getId().equals(pharmacist.getFacility().getId())) {
                return false;
            }

            // Pharmacists cannot cancel already delivered or cancelled deliveries
            return delivery.getStatus() != DeliveryStatus.DELIVERED &&
                    delivery.getStatus() != DeliveryStatus.CANCELLED;
        } catch (Exception e) {
            log.error("Error checking if delivery is cancellable by pharmacist: {}", deliveryId, e);
            return false;
        }
    }

    // Private helper methods

    private MedicationDelivery initializeDelivery(UUID prescriptionId, Account patientAccount,
            DeliveryMethod deliveryMethod, Address deliveryAddress) throws AppException {
        Prescription prescription = prescriptionService.findById(prescriptionId);

        if (!prescription.getPatient().getAccount().getId().equals(patientAccount.getId())) {
            throw new AppException("Action not authorized: Prescription does not belong to patient.");
        }

        if (deliveryRepository.existsByPrescriptionId(prescriptionId)) {
            throw new AppException("Delivery already exists for this prescription.");
        }

        DeliveryHandler handler = getDeliveryHandler(deliveryMethod);
        MedicationDelivery delivery = handler.initializeDelivery(prescription);

        if (deliveryAddress != null) {
            delivery.setDeliveryAddress(deliveryAddress.getAddress1() + ", " + deliveryAddress.getAddress2());
            delivery.setDeliveryCity(deliveryAddress.getCity());
            delivery.setDeliveryState(deliveryAddress.getState());
            delivery.setDeliveryPostcode(delivery.getDeliveryPostcode());
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
