package com.mytelmed.common.listener;

import com.mytelmed.common.events.email.AccountActivatedEvent;
import com.mytelmed.common.events.email.AccountDeactivatedEvent;
import com.mytelmed.infrastructure.email.service.EmailService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;


@Slf4j
@Component
public class AccountListener {
    private final EmailService emailService;

    public AccountListener(EmailService emailService) {
        this.emailService = emailService;
    }

    @Async
    @EventListener
    public void handleAccountActivated(AccountActivatedEvent event) {
        emailService.sendAccountActivationEmail(event.email(), event.username(), event.password());
    }

    @Async
    @EventListener
    public void handleAccountDeactivated(AccountDeactivatedEvent event) {
        emailService.sendAccountDeactivationEmail(event.email(), event.name(), event.username());
    }
}
