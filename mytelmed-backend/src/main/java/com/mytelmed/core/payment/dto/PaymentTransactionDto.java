package com.mytelmed.core.payment.dto;

import com.mytelmed.common.constant.payment.PaymentMode;
import com.mytelmed.core.payment.entity.PaymentTransaction;
import java.math.BigDecimal;
import java.time.Instant;

public record PaymentTransactionDto(
    String id,
    String transactionNumber,
    String billId,
    String patientId,
    String patientName,
    BigDecimal amount,
    PaymentMode paymentMode,
    PaymentTransaction.TransactionStatus status,
    String currency,
    String failureReason,
    Instant processedAt,
    Instant createdAt,
    Instant updatedAt) {
}