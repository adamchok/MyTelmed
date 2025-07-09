package com.mytelmed.core.facility.dto;

import com.mytelmed.common.constant.FacilityType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateFacilityRequestDto(
        @NotBlank(message = "Name is required")
        @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
        String name,

        @Pattern(regexp = "^\\d{10}$", message = "Telephone number must be exactly 10 digits")
        @NotBlank(message = "Telephone is required")
        String telephone,

        @NotBlank(message = "Address is required")
        @Size(min = 10, max = 255, message = "Address must be between 10 and 255 characters")
        String address,

        @NotBlank(message = "City is required")
        @Size(min = 2, max = 50, message = "City must be between 2 and 50 characters")
        String city,

        @NotBlank(message = "State is required")
        @Size(min = 2, max = 50, message = "State must be between 2 and 50 characters")
        String state,

        @NotNull(message = "Facility type is required")
        FacilityType facilityType
) {
} 