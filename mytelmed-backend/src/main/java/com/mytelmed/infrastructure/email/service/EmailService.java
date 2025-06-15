package com.mytelmed.infrastructure.email.service;

import com.mailgun.api.v3.MailgunMessagesApi;
import com.mailgun.model.message.Message;
import com.mytelmed.common.advice.exception.EmailSendingException;
import com.mytelmed.common.constants.EmailType;
import feign.Response;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionException;


@Service
@Slf4j
public class EmailService {
    private final String mailGunApiDomain;
    private final String uiHost;
    private final MailgunMessagesApi mailgunMessagesApi;
    private final SpringTemplateEngine templateEngine;

    public EmailService(@Value("${mailgun.api.domain}") String mailGunApiDomain,
                        @Value("${application.ui-host}") String uiHost,
                        MailgunMessagesApi mailgunMessagesApi,
                        SpringTemplateEngine templateEngine) {
        this.mailGunApiDomain = mailGunApiDomain;
        this.uiHost = uiHost;
        this.mailgunMessagesApi = mailgunMessagesApi;
        this.templateEngine = templateEngine;
    }

    private Message createEmailMessage(String to, String subject, String templateName, Context context) {
        String domain = "noreply@" + mailGunApiDomain;
        String htmlContent = templateEngine.process(templateName, context);

        return Message.builder()
                .from(domain)
                .to(to)
                .subject(subject)
                .html(htmlContent)
                .build();
    }

    private void sendEmail(Message message, EmailType emailType, String recipient) throws EmailSendingException {
        try {
            CompletableFuture<Response> feignResponse = mailgunMessagesApi.sendMessageFeignResponseAsync(mailGunApiDomain, message);
            try (Response response = feignResponse.join()) {
                if (response.status() < 200 || response.status() >= 300) {
                    log.error("Failed to send {} email to: {}", emailType.toString(), recipient);
                    throw new EmailSendingException("Failed to send + " + emailType + " email");
                }
                log.info("Successfully sent {} email to: {}", emailType.toString(), recipient);
            }
        } catch (CompletionException ce) {
            log.error("Completion error occurred while sending {} email to {}: {}", emailType.toString(), recipient, ce.getMessage(), ce);
            throw new EmailSendingException("Failed to send " + emailType + " email.");
        } catch (Exception e) {
            log.error("Unexpected error occurred while sending {} email to {}: {}", emailType.toString(), recipient, e.getMessage(), e);
            throw new EmailSendingException("Failed to send " + emailType + " email.");
        }
    }

    public void sendVerificationEmail(String emailTo, String token) {
        log.debug("Sending verification email to: {}", emailTo);

        Context context = new Context();
        context.setVariable("token", token);

        Message message = createEmailMessage(
                emailTo,
                "Your MyTelmed account email verification code is " + token,
                "verify/verification",
                context
        );

        sendEmail(message, EmailType.VERIFICATION, emailTo);
    }

    public void sendPasswordResetEmail(String email, String name, String resetUrl) {
        log.debug("Sending password reset email to: {}", email);

        Context context = new Context();
        context.setVariable("name", name);
        context.setVariable("resetUrl", resetUrl);

        Message message = createEmailMessage(
                email,
                "MyTelmed Password Reset",
                "reset/password-reset",
                context
        );

        sendEmail(message, EmailType.PASSWORD_RESET, email);
        log.info("Password reset email sent to: {}", email);
    }

    public void sendEmailResetEmail(String email, String name, String resetUrl) {
        log.debug("Sending email reset email to: {}", email);

        Context context = new Context();
        context.setVariable("name", name);
        context.setVariable("resetUrl", resetUrl);

        Message message = createEmailMessage(
                email,
                "MyTelmed Email Reset",
                "reset/email-reset",
                context
        );

        sendEmail(message, EmailType.EMAIL_RESET, email);
        log.info("Email reset email sent to: {}", email);
    }

    public void notifyNewFamilyMember(String email, String familyMemberName, String patientName, String invitationUrl) {
        log.debug("Sending family member invitation email to: {}", email);

        Context context = new Context();
        context.setVariable("name", familyMemberName);
        context.setVariable("patientName", patientName);
        context.setVariable("invitationUrl", invitationUrl);

        Message message = createEmailMessage(
                email,
                "MyTelmed Family Member Invitation",
                "family/family-member-invite",
                context
        );

        sendEmail(message, EmailType.FAMILY_INVITATION, email);
        log.info("Family invitation email sent to: {}", email);
    }

    public void notifyFamilyMemberConfirmation(String email, String familyMemberName, String patientName) {
        log.debug("Sending family member confirmation email to: {}", email);

        Context context = new Context();
        context.setVariable("name", familyMemberName);
        context.setVariable("patientName", patientName);
        context.setVariable("url", uiHost);

        Message message = createEmailMessage(
                email,
                "MyTelmed Family Member Access Confirmed",
                "family/family-member-confirm",
                context
        );

        sendEmail(message, EmailType.FAMILY_CONFIRMATION, email);
    }

    public void notifyFamilyMemberRemoval(String email, String familyMemberName, String patientName) {
        log.debug("Sending family member removal notification to: {}", email);

        Context context = new Context();
        context.setVariable("name", familyMemberName);
        context.setVariable("patientName", patientName);

        Message message = createEmailMessage(
                email,
                "MyTelmed Family Member Access Removed",
                "family/family-member-remove",
                context
        );

        sendEmail(message, EmailType.FAMILY_REMOVAL, email);
    }
}

