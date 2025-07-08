package com.mytelmed.common.event.payment.model;

import com.mytelmed.core.payment.entity.Bill;
import com.mytelmed.core.payment.entity.PaymentTransaction;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

/**
 * Event published when a payment is successfully completed in the Malaysian
 * public healthcare
 * telemedicine system. This triggers the sending of a receipt email to the
 * patient.
 */
@Builder
public record PaymentCompletedEvent(
    @NotNull(message = "Bill is required") Bill bill,
    @NotNull(message = "Payment transaction is required") PaymentTransaction transaction) {
}