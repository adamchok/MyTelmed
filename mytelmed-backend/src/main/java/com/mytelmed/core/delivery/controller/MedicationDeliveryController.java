package com.mytelmed.core.delivery.controller;

import com.mytelmed.common.constant.delivery.DeliveryStatus;
import com.mytelmed.common.dto.ApiResponse;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.delivery.dto.CancelDeliveryRequestDto;
import com.mytelmed.core.delivery.dto.ChooseHomeDeliveryRequestDto;
import com.mytelmed.core.delivery.dto.ChoosePickupRequestDto;
import com.mytelmed.core.delivery.dto.MarkOutForDeliveryRequestDto;
import com.mytelmed.core.delivery.dto.MedicationDeliveryDto;
import com.mytelmed.core.delivery.entity.MedicationDelivery;
import com.mytelmed.core.delivery.mapper.MedicationDeliveryMapper;
import com.mytelmed.core.delivery.service.MedicationDeliveryService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

/**
 * REST controller for medication delivery operations in Malaysian public
 * healthcare telemedicine.
 * Provides endpoints for managing delivery logistics separated from
 * prescription medical data.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/deliveries")
public class MedicationDeliveryController {

  private final MedicationDeliveryService deliveryService;
  private final MedicationDeliveryMapper deliveryMapper;

  public MedicationDeliveryController(MedicationDeliveryService deliveryService,
      MedicationDeliveryMapper deliveryMapper) {
    this.deliveryService = deliveryService;
    this.deliveryMapper = deliveryMapper;
  }

  /**
   * Get delivery by ID
   */
  @GetMapping("/{deliveryId}")
  public ResponseEntity<ApiResponse<MedicationDeliveryDto>> getDeliveryById(
      @PathVariable UUID deliveryId) {
    log.info("Getting delivery by ID: {}", deliveryId);

    MedicationDelivery delivery = deliveryService.findById(deliveryId);
    MedicationDeliveryDto deliveryDto = deliveryMapper.toDto(delivery);

    return ResponseEntity.ok(ApiResponse.success(deliveryDto));
  }

  /**
   * Get delivery by prescription ID
   */
  @GetMapping("/prescription/{prescriptionId}")
  public ResponseEntity<ApiResponse<MedicationDeliveryDto>> getDeliveryByPrescriptionId(
      @PathVariable UUID prescriptionId) {
    log.info("Getting delivery by prescription ID: {}", prescriptionId);

    MedicationDelivery delivery = deliveryService.findByPrescriptionId(prescriptionId);
    MedicationDeliveryDto deliveryDto = deliveryMapper.toDto(delivery);

    return ResponseEntity.ok(ApiResponse.success(deliveryDto));
  }

  /**
   * Get deliveries for patient
   */
  @GetMapping("/patient/{patientId}")
  public ResponseEntity<ApiResponse<Page<MedicationDeliveryDto>>> getDeliveriesByPatient(
      @PathVariable UUID patientId,
      Pageable pageable) {
    log.info("Getting deliveries for patient: {}", patientId);

    Page<MedicationDelivery> deliveries = deliveryService.findByPatientId(patientId, pageable);
    Page<MedicationDeliveryDto> deliveryDtos = deliveries.map(deliveryMapper::toDto);

    return ResponseEntity.ok(ApiResponse.success(deliveryDtos));
  }

  /**
   * Get deliveries for facility
   */
  @GetMapping("/facility/{facilityId}")
  public ResponseEntity<ApiResponse<Page<MedicationDeliveryDto>>> getDeliveriesByFacility(
      @PathVariable UUID facilityId,
      Pageable pageable) {
    log.info("Getting deliveries for facility: {}", facilityId);

    Page<MedicationDelivery> deliveries = deliveryService.findByFacilityId(facilityId, pageable);
    Page<MedicationDeliveryDto> deliveryDtos = deliveries.map(deliveryMapper::toDto);

    return ResponseEntity.ok(ApiResponse.success(deliveryDtos));
  }

  /**
   * Get deliveries by status
   */
  @GetMapping("/status/{status}")
  public ResponseEntity<ApiResponse<Page<MedicationDeliveryDto>>> getDeliveriesByStatus(
      @PathVariable DeliveryStatus status,
      Pageable pageable) {
    log.info("Getting deliveries by status: {}", status);

    Page<MedicationDelivery> deliveries = deliveryService.findByStatus(status, pageable);
    Page<MedicationDeliveryDto> deliveryDtos = deliveries.map(deliveryMapper::toDto);

    return ResponseEntity.ok(ApiResponse.success(deliveryDtos));
  }

  /**
   * Patient chooses pickup delivery method
   */
  @PostMapping("/choose-pickup")
  public ResponseEntity<ApiResponse<MedicationDeliveryDto>> choosePickup(
      @Valid @RequestBody ChoosePickupRequestDto request,
      @AuthenticationPrincipal Account account) {
    log.info("Patient choosing pickup for prescription: {}", request.prescriptionId());

    MedicationDelivery delivery = deliveryService.choosePickup(request.prescriptionId(), account);
    MedicationDeliveryDto deliveryDto = deliveryMapper.toDto(delivery);

    return ResponseEntity.status(HttpStatus.CREATED)
        .body(ApiResponse.success(deliveryDto));
  }

  /**
   * Patient chooses home delivery method
   */
  @PostMapping("/choose-home-delivery")
  public ResponseEntity<ApiResponse<MedicationDeliveryDto>> chooseHomeDelivery(
      @Valid @RequestBody ChooseHomeDeliveryRequestDto request,
      @AuthenticationPrincipal Account account) {
    log.info("Patient choosing home delivery for prescription: {}", request.prescriptionId());

    MedicationDelivery delivery = deliveryService.chooseHomeDelivery(
        request.prescriptionId(), account, request.addressId());
    MedicationDeliveryDto deliveryDto = deliveryMapper.toDto(delivery);

    return ResponseEntity.status(HttpStatus.CREATED)
        .body(ApiResponse.success(deliveryDto));
  }

  /**
   * Process payment for delivery
   */
  @PutMapping("/{deliveryId}/process-payment")
  public ResponseEntity<ApiResponse<Void>> processPayment(
      @PathVariable UUID deliveryId,
      @AuthenticationPrincipal Account account) {
    log.info("Processing payment for delivery: {}", deliveryId);

    deliveryService.processPayment(deliveryId, account);

    return ResponseEntity.ok(ApiResponse.success("Payment processed successfully"));
  }

  /**
   * Pharmacist processes delivery
   */
  @PutMapping("/{deliveryId}/process")
  public ResponseEntity<ApiResponse<Void>> processDelivery(
      @PathVariable UUID deliveryId,
      @AuthenticationPrincipal Account account) {
    log.info("Pharmacist processing delivery: {}", deliveryId);

    deliveryService.processDelivery(deliveryId, account);

    return ResponseEntity.ok(ApiResponse.success("Delivery processed successfully"));
  }

  /**
   * Pharmacist marks delivery as out for delivery
   */
  @PutMapping("/mark-out-for-delivery")
  public ResponseEntity<ApiResponse<Void>> markOutForDelivery(
      @Valid @RequestBody MarkOutForDeliveryRequestDto request,
      @AuthenticationPrincipal Account account) {
    log.info("Marking delivery {} as out for delivery", request.deliveryId());

    deliveryService.markOutForDelivery(
        request.deliveryId(),
        account,
        request.courierName(),
        request.trackingReference(),
        request.contactPhone());

    return ResponseEntity.ok(ApiResponse.success("Delivery marked as out for delivery"));
  }

  /**
   * Patient or pharmacist marks delivery as completed
   */
  @PutMapping("/{deliveryId}/complete")
  public ResponseEntity<ApiResponse<Void>> markAsCompleted(
      @PathVariable UUID deliveryId,
      @AuthenticationPrincipal Account account) {
    log.info("Marking delivery {} as completed", deliveryId);

    deliveryService.markAsCompleted(deliveryId, account);

    return ResponseEntity.ok(ApiResponse.success("Delivery marked as completed"));
  }

  /**
   * Cancel delivery
   */
  @PutMapping("/cancel")
  public ResponseEntity<ApiResponse<Void>> cancelDelivery(
      @Valid @RequestBody CancelDeliveryRequestDto request) {
    log.info("Cancelling delivery: {}", request.deliveryId());

    deliveryService.cancelDelivery(request.deliveryId(), request.reason());

    return ResponseEntity.ok(ApiResponse.success("Delivery cancelled successfully"));
  }
}
