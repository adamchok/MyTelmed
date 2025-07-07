package com.mytelmed.infrastructure.email.strategy;

import com.mailgun.api.v3.MailgunMessagesApi;
import com.mailgun.model.message.Message;
import com.mytelmed.common.advice.exception.EmailSendingException;
import feign.Response;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.util.StringUtils;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionException;


@Slf4j
public abstract class BaseEmailSenderStrategy implements EmailSenderStrategy {
    protected final MailgunMessagesApi mailgunApi;
    protected final SpringTemplateEngine templateEngine;
    protected final String mailGunDomain;

    protected BaseEmailSenderStrategy(
            MailgunMessagesApi mailgunApi,
            SpringTemplateEngine templateEngine,
            @Value("${mailgun.api.domain}") String mailGunDomain) {
        this.mailgunApi = mailgunApi;
        this.templateEngine = templateEngine;
        this.mailGunDomain = mailGunDomain;
    }

    @Override
    @Retryable(retryFor = {EmailSendingException.class, CompletionException.class},
            backoff = @Backoff(delay = 1000, multiplier = 2))
    public final void sendEmail(String to, Map<String, Object> variables) {
        try {
            validateInput(to, variables);

            log.info("Sending {} email to: {}", getEmailType(), to);

            String content = processTemplate(variables);
            Message message = buildMessage(to, variables, content);

            sendEmailAsync(message, to);

            log.info("Successfully sent {} email to: {}", getEmailType(), to);

        } catch (Exception e) {
            log.error("Failed to send {} email to: {}", getEmailType(), to, e);
            throw new EmailSendingException("Failed to send " + getEmailType() + " email", e);
        }
    }

    protected void validateInput(String to, Map<String, Object> variables) {
        if (!StringUtils.hasText(to)) {
            throw new IllegalArgumentException("Email recipient cannot be null or empty");
        }

        if (!to.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            throw new IllegalArgumentException("Invalid email address format: " + to);
        }

        if (variables == null) {
            throw new IllegalArgumentException("Email variables cannot be null");
        }

        validateRequiredVariables(variables);
    }

    protected String processTemplate(Map<String, Object> variables) {
        Context context = new Context();
        context.setVariables(variables);
        return templateEngine.process(getTemplatePath(), context);
    }

    protected Message buildMessage(String to, Map<String, Object> variables, String content) {
        return Message.builder()
                .from(getFromAddress())
                .to(to)
                .subject(buildSubject(variables))
                .html(content)
                .build();
    }

    protected void sendEmailAsync(Message message, String to) {
        CompletableFuture<Response> feignResponse = mailgunApi.sendMessageFeignResponseAsync(mailGunDomain, message);

        try (Response response = feignResponse.join()) {
            if (response.status() < 200 || response.status() >= 300) {
                throw new EmailSendingException("Mailgun API returned error status: " + response.status());
            }
        } catch (CompletionException ce) {
            throw new EmailSendingException("Async email sending failed", ce.getCause());
        }
    }

    protected String getFromAddress() {
        return "noreply@" + mailGunDomain;
    }

    protected abstract String getTemplatePath();

    protected abstract String buildSubject(Map<String, Object> variables);

    protected abstract void validateRequiredVariables(Map<String, Object> variables);
}
