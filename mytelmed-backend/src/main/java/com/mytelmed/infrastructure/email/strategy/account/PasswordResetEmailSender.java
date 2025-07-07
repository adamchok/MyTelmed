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
public class PasswordResetEmailSender extends BaseEmailSenderStrategy {
    public PasswordResetEmailSender(
            MailgunMessagesApi mailgunApi,
            SpringTemplateEngine templateEngine,
            @Value("${mailgun.api.domain}") String mailGunDomain) {
        super(mailgunApi, templateEngine, mailGunDomain);
    }

    @Override
    public EmailType getEmailType() {
        return EmailType.PASSWORD_RESET;
    }

    @Override
    protected String getTemplatePath() {
        return "reset/password-reset";
    }

    @Override
    protected String buildSubject(Map<String, Object> variables) {
        return "MyTelmed - Reset Your Password";
    }

    @Override
    protected void validateRequiredVariables(Map<String, Object> variables) {
        String name = (String) variables.get("name");
        String resetToken = (String) variables.get("resetToken");
        String uiHost = (String) variables.get("uiHost");

        if (!StringUtils.hasText(name)) {
            throw new IllegalArgumentException("Name is required and cannot be empty");
        }
        if (!StringUtils.hasText(resetToken)) {
            throw new IllegalArgumentException("Reset Token is required and cannot be empty");
        }

        if (!StringUtils.hasText(uiHost)) {
            throw new IllegalArgumentException("UI host is required and cannot be empty");
        }

        log.debug("Validation passed for password reset email for user: {}", name);
    }
}