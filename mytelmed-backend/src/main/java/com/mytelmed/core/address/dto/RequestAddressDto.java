package com.mytelmed.core.address.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import org.hibernate.validator.constraints.Length;


public record RequestAddressDto(
        @Length(max = 300, message = "Address must be less than 300 characters")
        @NotBlank(message = "Address is required")
        String address,

        @Pattern(regexp = "\\d{5}", message = "Postcode must be 5 digits")
        @NotBlank(message = "Postcode is required")
        String postcode,

        @NotBlank(message = "City is required")
        String city,

        @NotBlank(message = "State is required")
        String state
) {
}
