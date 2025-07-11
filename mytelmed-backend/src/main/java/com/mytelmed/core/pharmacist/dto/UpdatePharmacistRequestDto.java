package com.mytelmed.core.pharmacist.dto;

import com.mytelmed.common.constant.Gender;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import java.util.UUID;


@Builder
public record UpdatePharmacistRequestDto(
        @NotBlank(message = "Name is required") @Size(min = 2, max = 50, message = "Name must be between 2 and 50 characters") String name,

        @Pattern(regexp = "^\\d{12}$", message = "NRIC must be exactly 12 digits") @NotBlank(message = "NRIC is required") String nric,

        @Email(message = "Email should be valid") @NotBlank(message = "Email is required") String email,

        @Pattern(regexp = "^\\d{10}$", message = "Phone number must be exactly 10 digits") @NotBlank(message = "Phone is required") String phone,

        @NotBlank(message = "Date of birth is required") String dateOfBirth,

        @NotNull(message = "Gender is required") Gender gender,

        @NotNull(message = "Facility ID is required") UUID facilityId) {
}
