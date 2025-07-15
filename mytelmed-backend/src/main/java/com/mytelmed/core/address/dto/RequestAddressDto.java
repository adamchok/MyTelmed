package com.mytelmed.core.address.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import org.hibernate.validator.constraints.Length;

public record RequestAddressDto(
                @Length(max = 100, message = "Address name must be less than 100 characters") @NotBlank(message = "Address name is required") String addressName,

                @Length(max = 300, message = "Address line 1 must be less than 300 characters") @NotBlank(message = "Address line 1 is required") String address1,

                @Length(max = 300, message = "Address line 2 must be less than 300 characters") String address2,

                @Pattern(regexp = "\\d{5}", message = "Postcode must be 5 digits") @NotBlank(message = "Postcode is required") String postcode,

                @NotBlank(message = "City is required") String city,

                @NotBlank(message = "State is required") String state) {
}
