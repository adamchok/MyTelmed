package com.mytelmed.common.event.payment.model;

import com.mytelmed.core.payment.entity.Bill;
import com.mytelmed.core.payment.entity.PaymentTransaction;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import java.time.Instant;

/**
 * Event published when a payment refund fails to process.
 * Used for error handling, notifications, and system monitoring.
 */
@Builder
public record RefundFailedEvent(
    @NotNull(message = "Bill is required") Bill bill,

    @NotNull(message = "Payment transaction is required") PaymentTransaction transaction,

    @NotBlank(message = "Error message is required") String errorMessage,

    @NotNull(message = "Failed timestamp is required") Instant failedAt) {
}