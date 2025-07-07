package com.mytelmed.common.event.family.model;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;


@Builder
public record FamilyMemberJoinedEvent(
        @Email(message = "Family member email is invalid")
        @NotBlank(message = "Family member email is required")
        String memberEmail,

        @NotBlank(message = "Family member name is required")
        String memberName,

        @NotBlank(message = "Patient name is required")
        String patientName
) {
}