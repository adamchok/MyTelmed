package com.mytelmed.infrastructure.email.strategy.account;

import com.mailgun.api.v3.MailgunMessagesApi;
import com.mytelmed.infrastructure.email.constant.EmailType;
import com.mytelmed.infrastructure.email.strategy.BaseEmailSenderStrategy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.thymeleaf.spring6.SpringTemplateEngine;
import java.util.Map;


@Slf4j
@Component
public class AccountActivatedEmailSender extends BaseEmailSenderStrategy {
    public AccountActivatedEmailSender(
            MailgunMessagesApi mailgunApi,
            SpringTemplateEngine templateEngine,
            @Value("${mailgun.api.domain}") String mailGunDomain) {
        super(mailgunApi, templateEngine, mailGunDomain);
    }

    @Override
    public EmailType getEmailType() {
        return EmailType.ACCOUNT_ACTIVATED;
    }

    @Override
    protected String getTemplatePath() {
        return "account/activate";
    }

    @Override
    protected String buildSubject(Map<String, Object> variables) {
        return "MyTelmed - Account Activated";
    }

    @Override
    protected void validateRequiredVariables(Map<String, Object> variables) {
        String username = (String) variables.get("name");
        String role =  (String) variables.get("role");
        String uiHost = (String) variables.get("uiHost");

        if (!StringUtils.hasText(username)) {
            throw new IllegalArgumentException("Username is required and cannot be empty");
        }

        if (!StringUtils.hasText(role)) {
            throw new IllegalArgumentException("Role is required and cannot be empty");
        }

        if (!StringUtils.hasText(uiHost)) {
            throw new IllegalArgumentException("UI host is required and cannot be empty");
        }

        log.debug("Validation passed for account activation email for user: {}", username);
    }
}
