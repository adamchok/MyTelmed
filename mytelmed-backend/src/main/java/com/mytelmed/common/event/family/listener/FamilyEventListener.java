package com.mytelmed.common.event.family.listener;

import com.mytelmed.common.event.family.model.FamilyMemberInviteEvent;
import com.mytelmed.common.event.family.model.FamilyMemberJoinedEvent;
import com.mytelmed.common.event.family.model.FamilyMemberRemovedEvent;
import com.mytelmed.infrastructure.email.constant.EmailType;
import com.mytelmed.infrastructure.email.factory.EmailSenderFactoryRegistry;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import java.util.HashMap;
import java.util.Map;

@Component
public class FamilyEventListener {
    private static final String UI_HOST_KEY = "uiHost";

    private final EmailSenderFactoryRegistry emailService;
    private final String frontendUrl;

    public FamilyEventListener(EmailSenderFactoryRegistry emailService,
            @Value("${application.frontend.url}") String frontendUrl) {
        this.emailService = emailService;
        this.frontendUrl = frontendUrl;
    }

    @Async
    @EventListener
    public void handleFamilyMemberInvite(FamilyMemberInviteEvent event) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("inviteeName", event.inviteeName());
        variables.put("inviterName", event.inviterName());
        variables.put("relationship", event.relationship());
        variables.put("inviteUrl", event.invitationUrl());
        variables.put(UI_HOST_KEY, frontendUrl);

        emailService.getEmailSender(EmailType.FAMILY_MEMBER_INVITE).sendEmail(event.memberEmail(), variables);
    }

    @Async
    @EventListener
    public void handleFamilyMemberJoined(FamilyMemberJoinedEvent event) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("memberName", event.memberName());
        variables.put("patientName", event.patientName());
        variables.put(UI_HOST_KEY, frontendUrl);
        emailService.getEmailSender(EmailType.FAMILY_MEMBER_JOINED).sendEmail(event.memberEmail(), variables);
    }

    @Async
    @EventListener
    public void handleFamilyMemberRemoved(FamilyMemberRemovedEvent event) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("memberName", event.memberName());
        variables.put("patientName", event.patientName());
        variables.put(UI_HOST_KEY, frontendUrl);
        emailService.getEmailSender(EmailType.FAMILY_MEMBER_REMOVED).sendEmail(event.memberEmail(), variables);
    }
}
