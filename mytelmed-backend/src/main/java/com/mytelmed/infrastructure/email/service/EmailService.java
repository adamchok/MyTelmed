package com.mytelmed.infrastructure.email.service;

import com.mytelmed.common.constants.email.EmailFamily;
import com.mytelmed.common.constants.email.EmailType;
import com.mytelmed.common.factory.email.AbstractEmailSenderFactory;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


@Service
@Slf4j
public class EmailService {
    private final String uiHost;
    private final List<AbstractEmailSenderFactory> emailSenderFactoryList;

    public EmailService(@Value("${application.ui-host}") String uiHost,
                        List<AbstractEmailSenderFactory> emailSenderFactoryList) {
        this.uiHost = uiHost;
        this.emailSenderFactoryList = emailSenderFactoryList;
    }

    private void send(EmailType type, String to, Map<String, Object> variables) {
        EmailFamily family = type.getFamily();

        AbstractEmailSenderFactory factory = emailSenderFactoryList.stream()
                .filter(f -> f.supports(family))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("No factory for family: " + family));

        factory.getEmailSender(type).sendEmail(to, variables);
    }

    public void sendVerificationEmail(String to, String token) {
        log.debug("Sending verification email to: {}", to);

        Map<String, Object> variables = new HashMap<>();
        variables.put("token", token);

        send(EmailType.VERIFICATION, to, variables);
    }

    public void sendPasswordResetEmail(String to, String name, String resetUrl, long expirationInMinutes) {
        log.debug("Sending password reset email to: {}", to);

        Map<String, Object> variables = new HashMap<>();
        variables.put("name", name);
        variables.put("resetUrl", resetUrl);
        variables.put("expiration", expirationInMinutes);
        variables.put("uiHost", uiHost);

        send(EmailType.PASSWORD_RESET, to, variables);
    }

    public void sendEmailResetEmail(String to, String name, String resetUrl, long expirationInMinutes) {
        log.debug("Sending email reset email to: {}", to);

        Map<String, Object> variables = new HashMap<>();
        variables.put("name", name);
        variables.put("resetUrl", resetUrl);
        variables.put("expiration", expirationInMinutes);
        variables.put("uiHost", uiHost);

        send(EmailType.EMAIL_RESET, to, variables);
    }

    public void sendAccountActivationEmail(String to, String username, String password) {
        log.debug("Sending account activated email to: {}", to);

        Map<String, Object> variables = new HashMap<>();
        variables.put("username", username);
        variables.put("password", password);
        variables.put("uiHost", uiHost);

        send(EmailType.ACCOUNT_ACTIVATION, to, variables);
    }

    public void sendAccountDeactivationEmail(String to, String name, String username) {
        log.debug("Sending account deactivated email to: {}", to);

        Map<String, Object> variables = new HashMap<>();
        variables.put("name", name);
        variables.put("username", username);
        variables.put("uiHost", uiHost);

        send(EmailType.ACCOUNT_DEACTIVATION, to, variables);
    }

    public void sendFamilyMemberInvitationEmail(String to, String familyMemberName, String patientName, String invitationUrl) {
        log.debug("Sending family member invitation email to: {}", to);

        Map<String, Object> variables = new HashMap<>();
        variables.put("name", familyMemberName);
        variables.put("patientName", patientName);
        variables.put("invitationUrl", invitationUrl);
        variables.put("uiHost", uiHost);

        send(EmailType.FAMILY_INVITATION, to, variables);
    }

    public void sendFamilyMemberJoinedEmail(String to, String familyMemberName, String patientName) {
        log.debug("Sending family member joined email to: {}", to);

        Map<String, Object> variables = new HashMap<>();
        variables.put("name", familyMemberName);
        variables.put("patientName", patientName);
        variables.put("uiHost", uiHost);

        send(EmailType.FAMILY_JOINED, to, variables);
    }

    public void sendFamilyMemberRemovedEmail(String to, String familyMemberName, String patientName) {
        log.debug("Sending family member removal notification to: {}", to);

        Map<String, Object> variables = new HashMap<>();
        variables.put("name", familyMemberName);
        variables.put("patientName", patientName);

        send(EmailType.FAMILY_REMOVAL, to, variables);
    }
}

