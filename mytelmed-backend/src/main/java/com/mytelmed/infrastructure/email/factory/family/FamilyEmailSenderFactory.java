package com.mytelmed.infrastructure.email.factory.family;

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
public class FamilyEmailSenderFactory implements AbstractEmailSenderFactory {
    private final Map<EmailType, EmailSenderStrategy> familyEmailStrategyMap;

    public FamilyEmailSenderFactory(List<EmailSenderStrategy> strategies) {
        this.familyEmailStrategyMap = strategies.stream()
                .filter(strategy -> strategy.getEmailType().getFamily() == EmailFamily.FAMILY)
                .collect(Collectors.toMap(EmailSenderStrategy::getEmailType, Function.identity()));

        log.info("Initialized FamilyEmailSenderFactory with {} strategies: {}",
                familyEmailStrategyMap.size(), familyEmailStrategyMap.keySet());
    }

    @Override
    public boolean supports(EmailFamily family) {
        return family == EmailFamily.FAMILY;
    }

    @Override
    public EmailSenderStrategy getEmailSender(EmailType type) {
        return Optional.ofNullable(familyEmailStrategyMap.get(type))
                .orElseThrow(() -> new IllegalArgumentException("No email sender for family type: " + type));
    }
}