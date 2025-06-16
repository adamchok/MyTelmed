package com.mytelmed.common.factory.email;

import com.mytelmed.common.constants.email.EmailFamily;
import com.mytelmed.common.constants.email.EmailType;
import com.mytelmed.infrastructure.email.strategy.EmailSenderStrategy;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;


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
