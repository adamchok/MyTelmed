package com.mytelmed.core.payment.dto;

import com.mytelmed.common.constant.payment.BillType;
import com.mytelmed.common.constant.payment.BillingStatus;
import com.mytelmed.common.constant.payment.PaymentMode;
import java.math.BigDecimal;
import java.time.Instant;

public record BillDto(
        String id,
        String billNumber,
        BigDecimal amount,
        String patientId,
        String patientName,
        BillType billType,
        BillingStatus billingStatus,
        PaymentMode paymentMode,
        String appointmentId,
        String prescriptionId,
        String description,
        String receiptUrl,
        Instant billedAt,
        Instant paidAt,
        Instant cancelledAt,
        Instant createdAt,
        Instant updatedAt) {
}