package com.mytelmed.infrastructure.email.strategy;

import com.mailgun.api.v3.MailgunMessagesApi;
import com.mailgun.model.message.Message;
import com.mytelmed.common.advice.exception.EmailSendingException;
import com.mytelmed.common.constants.email.EmailType;
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
public class VerificationEmailSender implements EmailSenderStrategy {
    private final MailgunMessagesApi mailgunApi;
    private final SpringTemplateEngine templateEngine;
    private final String mailGunDomain;

    public VerificationEmailSender(
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
        return EmailType.VERIFICATION;
    }

    @Override
    public void sendEmail(String to, Map<String, Object> variables) {
        Context context = new Context();
        context.setVariables(variables);
        String content = templateEngine.process("verify/verification", context);

        Message message = Message.builder()
                .from("noreply@" + mailGunDomain)
                .to(to)
                .subject("Your MyTelmed account verification code is " + variables.get("token"))
                .html(content)
                .build();

        try {
            CompletableFuture<Response> feignResponse = mailgunApi.sendMessageFeignResponseAsync(mailGunDomain, message);
            try (Response response = feignResponse.join()) {
                if (response.status() < 200 || response.status() >= 300) {
                    log.error("Failed to send verification email to: {}", to);
                    throw new EmailSendingException("Failed to send verification email");
                }
                log.info("Successfully sent verification email to: {}", to);
            }
        } catch (CompletionException ce) {
            log.error("Completion error occurred while sending verification email to {}", to, ce);
            throw new EmailSendingException("Failed to send verification email.");
        } catch (Exception e) {
            log.error("Unexpected error occurred while sending verification email to {}", to, e);
            throw new EmailSendingException("Failed to send verification email");
        }
    }
}
