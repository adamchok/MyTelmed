package com.mytelmed.infrastructure.email.factory.account;

import com.mytelmed.infrastructure.email.constant.EmailFamily;
import com.mytelmed.infrastructure.email.constant.EmailType;
import com.mytelmed.infrastructure.email.factory.AbstractEmailSenderFactory;
import com.mytelmed.infrastructure.email.strategy.EmailSenderStrategy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;


@Slf4j
@Component
public class AccountEmailSenderFactory implements AbstractEmailSenderFactory {
    private final Map<EmailType, EmailSenderStrategy> accountEmailStrategyMap;

    public AccountEmailSenderFactory(List<EmailSenderStrategy> strategies) {
        this.accountEmailStrategyMap = strategies.stream()
                .filter(strategy -> strategy.getEmailType().getFamily() == EmailFamily.ACCOUNT)
                .collect(Collectors.toMap(EmailSenderStrategy::getEmailType, Function.identity()));
    }

    @Override
    public boolean supports(EmailFamily family) {
        return family == EmailFamily.ACCOUNT;
    }

    @Override
    public EmailSenderStrategy getEmailSender(EmailType type) {
        return Optional.ofNullable(accountEmailStrategyMap.get(type))
                .orElseThrow(() -> new IllegalArgumentException("No email sender for type: " + type));
    }
}
