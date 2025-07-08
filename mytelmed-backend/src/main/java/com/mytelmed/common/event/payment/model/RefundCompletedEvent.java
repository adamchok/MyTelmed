package com.mytelmed.common.event.payment.model;

import com.mytelmed.core.payment.entity.Bill;
import com.mytelmed.core.payment.entity.PaymentTransaction;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import java.math.BigDecimal;

/**
 * Event published when a payment refund is successfully completed.
 * Used for sending notifications and triggering follow-up actions.
 */
@Builder
public record RefundCompletedEvent(
    @NotNull(message = "Bill is required") Bill bill,

    @NotNull(message = "Payment transaction is required") PaymentTransaction transaction,

    @NotBlank(message = "Stripe refund ID is required") String stripeRefundId,

    @NotNull(message = "Refund amount is required") BigDecimal refundAmount,

    String refundReason) {
}