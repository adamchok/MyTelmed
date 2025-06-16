package com.mytelmed.common.factory.email;

import com.mytelmed.common.constants.email.EmailType;
import com.mytelmed.infrastructure.email.strategy.EmailSenderStrategy;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;


@Component
public class EmailSenderFactory {
    private final Map<EmailType, EmailSenderStrategy> strategyMap;

    public EmailSenderFactory(List<EmailSenderStrategy> strategies) {
        this.strategyMap = strategies.stream()
                .collect(Collectors.toMap(EmailSenderStrategy::getEmailType, Function.identity()));
    }

    public EmailSenderStrategy getStrategy(EmailType type) {
        return Optional.ofNullable(strategyMap.get(type))
                .orElseThrow(() -> new IllegalArgumentException("No strategy found for email type: " + type));
    }
}

