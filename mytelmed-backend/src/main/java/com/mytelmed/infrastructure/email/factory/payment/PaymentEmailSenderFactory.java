package com.mytelmed.infrastructure.email.factory.payment;

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

/**
 * Email sender factory for payment and billing notifications in Malaysian
 * public healthcare telemedicine.
 * Handles invoice and receipt email strategies.
 */
@Slf4j
@Component
public class PaymentEmailSenderFactory implements AbstractEmailSenderFactory {
  private final Map<EmailType, EmailSenderStrategy> paymentEmailStrategyMap;

  public PaymentEmailSenderFactory(List<EmailSenderStrategy> strategies) {
    this.paymentEmailStrategyMap = strategies.stream()
        .filter(strategy -> strategy.getEmailType().getFamily() == EmailFamily.PAYMENT)
        .collect(Collectors.toMap(EmailSenderStrategy::getEmailType, Function.identity()));

    log.info("Initialized PaymentEmailSenderFactory with {} payment email strategies",
        paymentEmailStrategyMap.size());
  }

  @Override
  public boolean supports(EmailFamily family) {
    return family == EmailFamily.PAYMENT;
  }

  @Override
  public EmailSenderStrategy getEmailSender(EmailType type) {
    return Optional.ofNullable(paymentEmailStrategyMap.get(type))
        .orElseThrow(() -> new IllegalArgumentException("No email sender for payment type: " + type));
  }
}
