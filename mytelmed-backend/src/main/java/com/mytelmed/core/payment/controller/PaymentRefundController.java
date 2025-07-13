package com.mytelmed.core.payment.controller;

import com.mytelmed.common.advice.AppException;
import com.mytelmed.common.dto.ApiResponse;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.payment.service.PaymentRefundService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

/**
 * REST Controller for managing payment refunds in Malaysian public healthcare
 * telemedicine.
 * Provides endpoints for refund status checking, manual refund processing, and
 * refund history.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/payments/refunds")
public class PaymentRefundController {

  private final PaymentRefundService paymentRefundService;

  public PaymentRefundController(PaymentRefundService paymentRefundService) {
    this.paymentRefundService = paymentRefundService;
  }

  /**
   * Get refund status for a specific appointment
   */
  @GetMapping("/appointment/{appointmentId}/status")
  public ResponseEntity<ApiResponse<PaymentRefundService.RefundStatus>> getAppointmentRefundStatus(
      @PathVariable UUID appointmentId,
      @AuthenticationPrincipal Account account) {

    log.debug("Getting refund status for appointment: {} by account: {}", appointmentId, account.getId());

    try {
      PaymentRefundService.RefundStatus refundStatus = paymentRefundService
          .getAppointmentRefundStatus(appointmentId);

      return ResponseEntity.ok(ApiResponse.success(refundStatus, "Refund status retrieved successfully"));
    } catch (Exception e) {
      log.error("Error getting refund status for appointment: {}", appointmentId, e);
      return ResponseEntity.internalServerError()
          .body(ApiResponse.failure(null, "Failed to retrieve refund status"));
    }
  }

  /**
   * Process manual refund for a cancelled appointment (Admin/Doctor use)
   */
  @PostMapping("/appointment/{appointmentId}/process")
  public ResponseEntity<ApiResponse<RefundResponseDto>> processManualRefund(
      @PathVariable UUID appointmentId,
      @RequestBody RefundRequestDto request,
      @AuthenticationPrincipal Account account) {

    log.info("Processing manual refund for appointment: {} by account: {}", appointmentId, account.getId());

    try {
      PaymentRefundService.RefundResult refundResult = paymentRefundService
          .processAppointmentCancellationRefund(appointmentId, request.reason(), account);

      RefundResponseDto response = RefundResponseDto.builder()
          .successful(refundResult.isSuccessful())
          .message(refundResult.getMessage())
          .stripeRefundId(refundResult.getRefund() != null ? refundResult.getRefund().getId() : null)
          .refundAmount(refundResult.getRefund() != null
              ? java.math.BigDecimal.valueOf(refundResult.getRefund().getAmount() / 100.0)
              : null)
          .build();

      if (refundResult.isSuccessful()) {
        return ResponseEntity.ok(ApiResponse.success(response, "Refund processed successfully"));
      } else {
        return ResponseEntity.badRequest()
            .body(ApiResponse.failure(null, "Refund processing failed: " + refundResult.getErrorMessage()));
      }
    } catch (AppException e) {
      log.error("App exception processing refund for appointment: {} - {}", appointmentId, e.getMessage());
      return ResponseEntity.badRequest().body(ApiResponse.failure(null, e.getMessage()));
    } catch (Exception e) {
      log.error("Unexpected error processing refund for appointment: {}", appointmentId, e);
      return ResponseEntity.internalServerError()
          .body(ApiResponse.failure(null, "Failed to process refund"));
    }
  }

  /**
   * Get refund status for a specific prescription
   */
  @GetMapping("/prescription/{prescriptionId}/status")
  public ResponseEntity<ApiResponse<PaymentRefundService.RefundStatus>> getPrescriptionRefundStatus(
      @PathVariable UUID prescriptionId,
      @AuthenticationPrincipal Account account) {

    log.debug("Getting refund status for prescription: {} by account: {}", prescriptionId, account.getId());

    try {
      PaymentRefundService.RefundStatus refundStatus = paymentRefundService
          .getPrescriptionRefundStatus(prescriptionId);

      return ResponseEntity.ok(ApiResponse.success(refundStatus, "Prescription refund status retrieved successfully"));
    } catch (Exception e) {
      log.error("Error getting refund status for prescription: {}", prescriptionId, e);
      return ResponseEntity.internalServerError()
          .body(ApiResponse.failure(null, "Failed to retrieve prescription refund status"));
    }
  }

  /**
   * Process manual refund for a cancelled prescription delivery (Admin/Pharmacist use)
   */
  @PostMapping("/prescription/{prescriptionId}/process")
  public ResponseEntity<ApiResponse<RefundResponseDto>> processPrescriptionRefund(
      @PathVariable UUID prescriptionId,
      @RequestBody RefundRequestDto request,
      @AuthenticationPrincipal Account account) {

    log.info("Processing manual refund for prescription: {} by account: {}", prescriptionId, account.getId());

    try {
      PaymentRefundService.RefundResult refundResult = paymentRefundService
          .processPrescriptionRefund(prescriptionId, request.reason());

      RefundResponseDto response = RefundResponseDto.builder()
          .successful(refundResult.isSuccessful())
          .message(refundResult.getMessage())
          .stripeRefundId(refundResult.getRefund() != null ? refundResult.getRefund().getId() : null)
          .refundAmount(refundResult.getRefund() != null
              ? java.math.BigDecimal.valueOf(refundResult.getRefund().getAmount() / 100.0)
              : null)
          .build();

      if (refundResult.isSuccessful()) {
        return ResponseEntity.ok(ApiResponse.success(response, "Prescription refund processed successfully"));
      } else {
        return ResponseEntity.badRequest()
            .body(ApiResponse.failure(null, "Prescription refund processing failed: " + refundResult.getErrorMessage()));
      }
    } catch (AppException e) {
      log.error("App exception processing refund for prescription: {} - {}", prescriptionId, e.getMessage());
      return ResponseEntity.badRequest().body(ApiResponse.failure(null, e.getMessage()));
    } catch (Exception e) {
      log.error("Unexpected error processing refund for prescription: {}", prescriptionId, e);
      return ResponseEntity.internalServerError()
          .body(ApiResponse.failure(null, "Failed to process prescription refund"));
    }
  }

  // DTOs for request/response

  public record RefundRequestDto(
      String reason) {
  }

  @lombok.Builder
  public record RefundResponseDto(
      boolean successful,
      String message,
      String stripeRefundId,
      java.math.BigDecimal refundAmount) {
  }
}