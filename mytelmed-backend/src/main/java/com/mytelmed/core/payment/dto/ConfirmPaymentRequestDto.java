package com.mytelmed.core.payment.dto;

import jakarta.validation.constraints.NotBlank;

public record ConfirmPaymentRequestDto(
    @NotBlank(message = "Payment intent ID is required") String paymentIntentId,

    @NotBlank(message = "Payment method ID is required") String paymentMethodId) {
}