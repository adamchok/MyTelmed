package com.mytelmed.infrastructure.email.factory.appointment;

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
public class AppointmentEmailSenderFactory implements AbstractEmailSenderFactory {
    private final Map<EmailType, EmailSenderStrategy> appointmentEmailStrategyMap;

    public AppointmentEmailSenderFactory(List<EmailSenderStrategy> strategies) {
        this.appointmentEmailStrategyMap = strategies.stream()
                .filter(strategy -> strategy.getEmailType().getFamily() == EmailFamily.APPOINTMENT)
                .collect(Collectors.toMap(EmailSenderStrategy::getEmailType, Function.identity()));

        log.info("Initialized AppointmentEmailSenderFactory with {} strategies: {}",
                appointmentEmailStrategyMap.size(), appointmentEmailStrategyMap.keySet());
    }

    @Override
    public boolean supports(EmailFamily family) {
        return family == EmailFamily.APPOINTMENT;
    }

    @Override
    public EmailSenderStrategy getEmailSender(EmailType type) {
        return Optional.ofNullable(appointmentEmailStrategyMap.get(type))
                .orElseThrow(() -> new IllegalArgumentException("No email sender for appointment type: " + type));
    }
}
