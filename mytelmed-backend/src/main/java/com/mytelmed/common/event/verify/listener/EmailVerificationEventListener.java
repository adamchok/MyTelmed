package com.mytelmed.common.event.verify.listener;

import com.mytelmed.common.event.verify.model.EmailVerificationEvent;
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
public class EmailVerificationEventListener {
    private final EmailSenderFactoryRegistry emailService;
    private final String frontendUrl;

    public EmailVerificationEventListener(EmailSenderFactoryRegistry emailService,
                                          @Value("${application.frontend.url}") String frontendUrl) {
        this.emailService = emailService;
        this.frontendUrl = frontendUrl;
    }

    @Async
    @EventListener
    public void handleEmailVerification(EmailVerificationEvent event) {
        log.debug("Handling email verification event for: {}", event.email());

        Map<String, Object> variables = new HashMap<>();
        variables.put("verificationToken", event.token());
        variables.put("uiHost", frontendUrl);

        emailService.getEmailSender(EmailType.EMAIL_VERIFICATION).sendEmail(event.email(), variables);

        log.info("Email verification email sent successfully to: {}", event.email());
    }
}
