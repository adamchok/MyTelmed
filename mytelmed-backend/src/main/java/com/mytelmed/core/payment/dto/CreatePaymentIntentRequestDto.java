package com.mytelmed.core.payment.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.UUID;

public record CreatePaymentIntentRequestDto(
    @NotNull(message = "Amount is required") @DecimalMin(value = "0.01", message = "Amount must be greater than 0") BigDecimal amount,

    @Size(max = 3, min = 3, message = "Currency must be 3 characters") String currency,

    @Size(max = 500, message = "Description cannot exceed 500 characters") String description,

    // Optional - for appointment payments
    UUID appointmentId,

    // Optional - for prescription payments
    UUID prescriptionId) {
  public CreatePaymentIntentRequestDto {
    if (currency == null || currency.isEmpty()) {
      currency = "MYR";
    }
  }
}
