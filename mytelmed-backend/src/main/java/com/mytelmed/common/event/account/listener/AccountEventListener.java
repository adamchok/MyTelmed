package com.mytelmed.common.event.account.listener;

import com.mytelmed.common.event.account.model.AccountActivatedEvent;
import com.mytelmed.common.event.account.model.AccountCreatedEvent;
import com.mytelmed.common.event.account.model.AccountDeactivatedEvent;
import com.mytelmed.common.event.account.model.AccountDeletionEvent;
import com.mytelmed.common.event.account.model.AccountPasswordResetEvent;
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
public class AccountEventListener {
    private final EmailSenderFactoryRegistry emailService;
    private final String frontendUrl;

    public AccountEventListener(EmailSenderFactoryRegistry emailService,
                                @Value("${application.frontend.url}") String frontendUrl) {
        this.emailService = emailService;
        this.frontendUrl = frontendUrl;
    }

    @Async
    @EventListener
    public void handleAccountCreated(AccountCreatedEvent event) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("name", event.name());
        variables.put("username", event.username());
        variables.put("password", event.password());
        variables.put("uiHost", frontendUrl);

        emailService.getEmailSender(EmailType.ACCOUNT_CREATED).sendEmail(event.email(), variables);
    }

    @Async
    @EventListener
    public void handleAccountDeactivated(AccountDeactivatedEvent event) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("name", event.name());
        variables.put("uiHost", frontendUrl);

        emailService.getEmailSender(EmailType.ACCOUNT_DEACTIVATED).sendEmail(event.email(), variables);
    }

    @Async
    @EventListener
    public void handleAccountActivated(AccountActivatedEvent event) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("name", event.name());
        variables.put("uiHost", frontendUrl);

        emailService.getEmailSender(EmailType.ACCOUNT_ACTIVATED).sendEmail(event.email(), variables);
    }

    @Async
    @EventListener
    public void handleAccountDeletion(AccountDeletionEvent event) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("name", event.name());
        variables.put("uiHost", frontendUrl);

        emailService.getEmailSender(EmailType.ACCOUNT_DELETED).sendEmail(event.email(), variables);
    }

    @Async
    @EventListener
    public void handleAccountPasswordReset(AccountPasswordResetEvent event) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("name", event.name());
        variables.put("username", event.username());
        variables.put("password", event.password());
        variables.put("uiHost", frontendUrl);

        emailService.getEmailSender(EmailType.ACCOUNT_PASSWORD_RESET).sendEmail(event.email(), variables);
    }
}
