package com.mytelmed.common.event.payment.model;

import com.mytelmed.core.payment.entity.Bill;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

/**
 * Event published when a bill is generated for a patient in the Malaysian
 * public healthcare
 * telemedicine system. This triggers the sending of an invoice email to the
 * patient.
 */
@Builder
public record BillGeneratedEvent(
    @NotNull(message = "Bill is required") Bill bill) {
}