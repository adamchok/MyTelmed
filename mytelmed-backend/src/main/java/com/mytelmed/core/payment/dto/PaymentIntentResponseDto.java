package com.mytelmed.core.payment.dto;

import java.math.BigDecimal;

public record PaymentIntentResponseDto(
    String paymentIntentId,
    String clientSecret,
    BigDecimal amount,
    String currency,
    String status,
    String billId,
    String description) {
}