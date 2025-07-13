package com.mytelmed.infrastructure.email.factory.prescription;

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
public class PrescriptionEmailSenderFactory implements AbstractEmailSenderFactory {
    private final Map<EmailType, EmailSenderStrategy> prescriptionEmailStrategyMap;

    public PrescriptionEmailSenderFactory(List<EmailSenderStrategy> strategies) {
        this.prescriptionEmailStrategyMap = strategies.stream()
                .filter(strategy -> strategy.getEmailType().getFamily() == EmailFamily.PRESCRIPTION)
                .collect(Collectors.toMap(EmailSenderStrategy::getEmailType, Function.identity()));

        log.info("Initialized PrescriptionEmailSenderFactory with {} strategies: {}",
                prescriptionEmailStrategyMap.size(), prescriptionEmailStrategyMap.keySet());
    }

    @Override
    public boolean supports(EmailFamily family) {
        return family == EmailFamily.PRESCRIPTION;
    }

    @Override
    public EmailSenderStrategy getEmailSender(EmailType type) {
        return Optional.ofNullable(prescriptionEmailStrategyMap.get(type))
                .orElseThrow(() -> new IllegalArgumentException("No email sender for family type: " + type));
    }
}
