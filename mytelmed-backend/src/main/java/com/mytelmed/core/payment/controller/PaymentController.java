package com.mytelmed.core.payment.controller;

import com.mytelmed.common.dto.ApiResponse;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.payment.dto.BillDto;
import com.mytelmed.core.payment.dto.ConfirmPaymentRequestDto;
import com.mytelmed.core.payment.dto.PaymentIntentResponseDto;
import com.mytelmed.core.payment.dto.PaymentTransactionDto;
import com.mytelmed.core.payment.entity.Bill;
import com.mytelmed.core.payment.entity.PaymentTransaction;
import com.mytelmed.core.payment.mapper.PaymentMapper;
import com.mytelmed.core.payment.service.PaymentService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/payment")
public class PaymentController {
    private final PaymentService paymentService;
    private final PaymentMapper paymentMapper;

    public PaymentController(PaymentService paymentService, PaymentMapper paymentMapper) {
        this.paymentService = paymentService;
        this.paymentMapper = paymentMapper;
    }

    @PostMapping("/appointment/{appointmentId}/create-intent")
    public ResponseEntity<ApiResponse<PaymentIntentResponseDto>> createAppointmentPaymentIntent(
            @PathVariable UUID appointmentId,
            @AuthenticationPrincipal Account account) {
        log.info("Creating payment intent for appointment: {} by patient: {}", appointmentId, account.getId());

        PaymentIntentResponseDto response = paymentService.createAppointmentPaymentIntent(account, appointmentId);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/prescription/{prescriptionId}/create-intent")
    public ResponseEntity<ApiResponse<PaymentIntentResponseDto>> createPrescriptionPaymentIntent(
            @PathVariable UUID prescriptionId,
            @AuthenticationPrincipal Account account) {
        log.info("Creating payment intent for prescription: {} by patient: {}", prescriptionId, account.getId());

        PaymentIntentResponseDto response = paymentService.createPrescriptionPaymentIntent(account, prescriptionId);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/confirm")
    public ResponseEntity<ApiResponse<PaymentIntentResponseDto>> confirmPayment(
            @Valid @RequestBody ConfirmPaymentRequestDto request,
            @AuthenticationPrincipal Account account) {
        log.info("Confirming payment for payment intent: {} by patient: {}",
                request.paymentIntentId(), account.getId());

        PaymentIntentResponseDto response = paymentService.confirmPayment(
                account, request.paymentIntentId(), request.paymentMethodId());

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/bills")
    public ResponseEntity<ApiResponse<Page<BillDto>>> getPatientBills(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String patientId,
            @RequestParam(required = false) String billType,
            @RequestParam(required = false) String billingStatus,
            @RequestParam(required = false) String searchQuery,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @AuthenticationPrincipal Account account) {
        log.info(
                "Getting bills for patient: {} with filters - patientId: {}, billType: {}, billingStatus: {}, searchQuery: {}, startDate: {}, endDate: {}",
                account.getId(), patientId, billType, billingStatus, searchQuery, startDate, endDate);

        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Bill> bills = paymentService.getPatientBills(account, pageable, patientId, billType, billingStatus,
                searchQuery, startDate, endDate);
        Page<BillDto> billDtos = bills.map(paymentMapper::toDto);

        return ResponseEntity.ok(ApiResponse.success(billDtos));
    }

    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<Page<PaymentTransactionDto>>> getPatientTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @AuthenticationPrincipal Account account) {
        log.info("Getting transactions for patient: {}", account.getId());

        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<PaymentTransaction> transactions = paymentService.getPatientTransactions(account, pageable);
        Page<PaymentTransactionDto> transactionDtos = transactions.map(paymentMapper::toDto);

        return ResponseEntity.ok(ApiResponse.success(transactionDtos));
    }
}