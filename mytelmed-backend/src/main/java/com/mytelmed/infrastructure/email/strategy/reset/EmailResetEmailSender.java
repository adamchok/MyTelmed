package com.mytelmed.infrastructure.email.strategy.reset;

import com.mailgun.api.v3.MailgunMessagesApi;
import com.mailgun.model.message.Message;
import com.mytelmed.common.advice.exception.EmailSendingException;
import com.mytelmed.common.constants.email.EmailType;
import com.mytelmed.infrastructure.email.strategy.EmailSenderStrategy;
import feign.Response;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionException;


@Slf4j
@Component
public class EmailResetEmailSender implements EmailSenderStrategy {
    private final MailgunMessagesApi mailgunApi;
    private final SpringTemplateEngine templateEngine;
    private final String mailGunDomain;

    public EmailResetEmailSender(
            MailgunMessagesApi mailgunApi,
            SpringTemplateEngine templateEngine,
            @Value("${mailgun.api.domain}") String mailGunDomain
    ) {
        this.mailgunApi = mailgunApi;
        this.templateEngine = templateEngine;
        this.mailGunDomain = mailGunDomain;
    }

    @Override
    public EmailType getEmailType() {
        return EmailType.EMAIL_RESET;
    }

    @Override
    public void sendEmail(String to, Map<String, Object> variables) {
        Context context = new Context();
        context.setVariables(variables);
        String content = templateEngine.process("reset/email-reset", context);

        Message message = Message.builder()
                .from("noreply@" + mailGunDomain)
                .to(to)
                .subject("MyTelmed Account Email Reset")
                .html(content)
                .build();

        try {
            CompletableFuture<Response> feignResponse = mailgunApi.sendMessageFeignResponseAsync(mailGunDomain, message);
            try (Response response = feignResponse.join()) {
                if (response.status() < 200 || response.status() >= 300) {
                    log.error("Failed to send email reset email to: {}", to);
                    throw new EmailSendingException("Failed to send email reset email");
                }
                log.info("Successfully sent email reset email to: {}", to);
            }
        } catch (CompletionException ce) {
            log.error("Completion error occurred while sending email reset email to {}", to, ce);
            throw new EmailSendingException("Failed to send email reset email.");
        } catch (Exception e) {
            log.error("Unexpected error occurred while sending email reset email to {}", to, e);
            throw new EmailSendingException("Failed to send email reset email");
        }
    }
}
