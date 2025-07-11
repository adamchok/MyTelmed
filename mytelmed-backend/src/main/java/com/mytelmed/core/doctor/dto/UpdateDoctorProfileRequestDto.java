package com.mytelmed.core.doctor.dto;

import com.mytelmed.common.constant.Gender;
import com.mytelmed.common.constant.Language;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.List;


public record UpdateDoctorProfileRequestDto(
        @NotBlank(message = "Name is required")
        String name,

        @Email(message = "Email should be valid")
        @NotBlank(message = "Email is required")
        String email,

        @Pattern(regexp = "^\\d{10}$", message = "Phone number must be exactly 10 digits")
        @NotBlank(message = "Phone is required")
        String phone,

        @NotBlank(message = "Date of birth is required")
        String dateOfBirth,

        @NotNull(message = "Gender is required")
        Gender gender,

        @NotNull(message = "Languages are required")
        @Size(min = 1, message = "At least one language is required")
        List<Language> languageList,

        @NotBlank(message = "Qualifications are required")
        String qualifications
) {
}
