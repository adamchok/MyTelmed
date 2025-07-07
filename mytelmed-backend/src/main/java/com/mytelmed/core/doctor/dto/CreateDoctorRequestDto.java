package com.mytelmed.core.doctor.dto;

import com.mytelmed.common.constant.Gender;
import com.mytelmed.common.constant.Language;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.UUID;


public record CreateDoctorRequestDto(
        @NotBlank(message = "Name is required")
        String name,

        @Pattern(regexp = "^\\d{12}$", message = "NRIC must be exactly 12 digits")
        @NotBlank(message = "NRIC is required")
        String nric,

        @Email(message = "Email should be valid")
        @NotBlank(message = "Email is required")
        String email,

        @Pattern(regexp = "^\\d{9}$", message = "Phone number must be exactly 9 digits")
        @NotBlank(message = "Phone is required")
        String phone,

        @NotBlank(message = "Date of birth is required")
        String dateOfBirth,

        @NotBlank(message = "Gender is required")
        Gender gender,

        @NotNull(message = "Facility ID is required")
        UUID facilityId,

        @NotNull(message = "Specialities are required")
        @Size(min = 1, message = "At least one speciality is required")
        List<UUID> specialityIds,

        @NotNull(message = "Languages are required")
        @Size(min = 1, message = "At least one language is required")
        List<Language> languageList,

        @NotBlank(message = "Qualifications are required")
        String qualifications
) {
}
