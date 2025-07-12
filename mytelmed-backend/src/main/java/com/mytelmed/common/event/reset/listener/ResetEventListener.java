package com.mytelmed.common.event.reset.listener;

import com.mytelmed.common.event.reset.model.EmailResetEvent;
import com.mytelmed.common.event.reset.model.PasswordResetEvent;
import com.mytelmed.infrastructure.email.constant.EmailType;
import com.mytelmed.infrastructure.email.factory.EmailSenderFactoryRegistry;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import java.util.HashMap;
import java.util.Map;


@Slf4j
@Component
public class ResetEventListener {
    private final EmailSenderFactoryRegistry emailService;
    private final String frontendUrl;

    public ResetEventListener(EmailSenderFactoryRegistry emailService,
                              @Value("${application.frontend.url}") String frontendUrl) {
        this.emailService = emailService;
        this.frontendUrl = frontendUrl;
    }

    @Async
    @EventListener
    public void handlePasswordReset(PasswordResetEvent event) {
        log.debug("Handling password reset event for: {}", event.email());

        Map<String, Object> variables = new HashMap<>();
        variables.put("name", event.name());
        variables.put("resetToken", event.resetToken());
        variables.put("expiration", String.valueOf(event.expirationMinutes()));
        variables.put("uiHost", frontendUrl);

        emailService.getEmailSender(EmailType.PASSWORD_RESET).sendEmail(event.email(), variables);

        log.info("Password reset email sent successfully to: {}", event.email());
    }

    @Async
    @EventListener
    public void handleEmailReset(EmailResetEvent event) {
        log.debug("Handling email reset event for: {}", event.email());

        Map<String, Object> variables = new HashMap<>();
        variables.put("name", event.name());
        variables.put("username", event.username());
        variables.put("resetToken", event.resetToken());
        variables.put("expiration", String.valueOf(event.expirationMinutes()));
        variables.put("uiHost", frontendUrl);

        emailService.getEmailSender(EmailType.EMAIL_RESET).sendEmail(event.email(), variables);

        log.info("Email reset email sent successfully to: {}", event.email());
    }
}
