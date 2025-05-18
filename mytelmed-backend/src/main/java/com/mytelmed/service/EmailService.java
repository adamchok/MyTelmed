package com.mytelmed.service;

import com.mailgun.api.v3.MailgunMessagesApi;
import com.mailgun.model.message.Message;
import com.mytelmed.advice.exception.EmailSendingException;
import feign.FeignException;
import feign.Response;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.thymeleaf.context.Context;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionException;


@Service
@Slf4j
public class EmailService {
    private final String MAIL_GUN_API_DOMAIN;
    private final MailgunMessagesApi mailgunMessagesApi;
    private final SpringTemplateEngine templateEngine;

    public EmailService(@Value("${mailgun.api.domain}") String MAIL_GUN_API_DOMAIN, MailgunMessagesApi mailgunMessagesApi,
                        SpringTemplateEngine templateEngine) {
        this.MAIL_GUN_API_DOMAIN = MAIL_GUN_API_DOMAIN;
        this.mailgunMessagesApi = mailgunMessagesApi;
        this.templateEngine = templateEngine;
    }

    public void sendVerificationEmail(String to, String token) {
        String recipient = "User <" + to + ">";
        String domain = "MyTelmed <postmaster@" + MAIL_GUN_API_DOMAIN + ">";
        String subject = "Your MyTelmed account email verification code is " + token;
        Context context = new Context();
        context.setVariable("token", token);
        String htmlContent = templateEngine.process("verification-email", context);

        Message message = Message.builder()
                .from(domain)
                .to(recipient)
                .subject(subject)
                .html(htmlContent)
                .build();

        try {
            CompletableFuture<Response> feignResponse = mailgunMessagesApi.sendMessageFeignResponseAsync(MAIL_GUN_API_DOMAIN, message);
            try (Response response = feignResponse.join()) {
                if (response.status() < 200 || response.status() >= 300) {
                    throw new EmailSendingException("Mailgun returned non-success status: " + response.status());
                }
            }
        } catch (CompletionException ce) {
            if (ce.getCause() instanceof FeignException feignEx) {
                throw new EmailSendingException("Failed to send email verification: " + feignEx.getMessage(), feignEx);
            }
            throw new EmailSendingException("Unexpected error occurred while sending email verification.", ce);
        } catch (Exception e) {
            throw new EmailSendingException("General error while sending email verification: " + e.getMessage(), e);
        }
    }

    public void sendPasswordResetEmail(String email, String name, String resetUrl) {
        String recipient = "User <" + email + ">";
        String domain = "MyTelmed <postmaster@" + MAIL_GUN_API_DOMAIN + ">";
        String subject = "MyTelmed Password Reset";
        Context context = new Context();
        context.setVariable("name", name);
        context.setVariable("resetUrl", resetUrl);
        String htmlContent = templateEngine.process("password-reset-email", context);

        Message message = Message.builder()
                .from(domain)
                .to(recipient)
                .subject(subject)
                .html(htmlContent)
                .build();

        try {
            CompletableFuture<Response> feignResponse = mailgunMessagesApi.sendMessageFeignResponseAsync(MAIL_GUN_API_DOMAIN, message);
            try (Response response = feignResponse.join()) {
                if (response.status() < 200 || response.status() >= 300) {
                    throw new EmailSendingException("Mailgun returned non-success status: " + response.status());
                }
                log.info("Password reset email sent to: {}", email);
            }
        } catch (CompletionException ce) {
            if (ce.getCause() instanceof FeignException feignEx) {
                throw new EmailSendingException("Failed to send password reset email: " + feignEx.getMessage(), feignEx);
            }
            throw new EmailSendingException("Unexpected error occurred while sending password reset email.", ce);
        } catch (Exception e) {
            throw new EmailSendingException("General error while sending password reset email: " + e.getMessage(), e);
        }
    }

    public void sendEmailResetEmail(String email, String name, String resetUrl) {
        String recipient = "User <" + email + ">";
        String domain = "MyTelmed <postmaster@" + MAIL_GUN_API_DOMAIN + ">";
        String subject = "MyTelmed Email Reset";
        Context context = new Context();
        context.setVariable("name", name);
        context.setVariable("resetUrl", resetUrl);
        String htmlContent = templateEngine.process("email-reset-email", context);

        Message message = Message.builder()
                .from(domain)
                .to(recipient)
                .subject(subject)
                .html(htmlContent)
                .build();

        try {
            CompletableFuture<Response> feignResponse = mailgunMessagesApi.sendMessageFeignResponseAsync(MAIL_GUN_API_DOMAIN, message);
            try (Response response = feignResponse.join()) {
                if (response.status() < 200 || response.status() >= 300) {
                    throw new EmailSendingException("Mailgun returned non-success status: " + response.status());
                }
                log.info("Email reset email sent to: {}", email);
            }
        } catch (CompletionException ce) {
            if (ce.getCause() instanceof FeignException feignEx) {
                throw new EmailSendingException("Failed to send email reset email: " + feignEx.getMessage(), feignEx);
            }
            throw new EmailSendingException("Unexpected error occurred while sending email reset email.", ce);
        } catch (Exception e) {
            throw new EmailSendingException("General error while sending email reset email: " + e.getMessage(), e);
        }
    }
}

