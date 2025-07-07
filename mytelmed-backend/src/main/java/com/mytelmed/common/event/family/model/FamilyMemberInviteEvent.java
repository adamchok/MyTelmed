package com.mytelmed.common.event.family.model;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;


@Builder
public record FamilyMemberInviteEvent(
        @Email(message = "Family member email is invalid")
        @NotBlank(message = "Family member email is required")
        String memberEmail,

        @NotBlank(message = "Invitee member name is required")
        String inviteeName,

        @NotBlank(message = "Inviter name is required")
        String inviterName,

        @NotBlank(message = "Relationship is required")
        String relationship,

        @NotBlank(message = "Invitation URL is required")
        String invitationUrl
) {
}
