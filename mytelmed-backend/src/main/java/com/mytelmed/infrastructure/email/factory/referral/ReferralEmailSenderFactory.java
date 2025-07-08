package com.mytelmed.infrastructure.email.factory.referral;

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
 * Email sender factory for referral notifications in Malaysian public
 * healthcare telemedicine.
 * Handles referral notification email strategies.
 */
@Slf4j
@Component
public class ReferralEmailSenderFactory implements AbstractEmailSenderFactory {
  private final Map<EmailType, EmailSenderStrategy> referralEmailStrategyMap;

  public ReferralEmailSenderFactory(List<EmailSenderStrategy> strategies) {
    this.referralEmailStrategyMap = strategies.stream()
        .filter(strategy -> strategy.getEmailType().getFamily() == EmailFamily.REFERRAL)
        .collect(Collectors.toMap(EmailSenderStrategy::getEmailType, Function.identity()));

    log.info("Initialized ReferralEmailSenderFactory with {} referral email strategies",
        referralEmailStrategyMap.size());
  }

  @Override
  public boolean supports(EmailFamily family) {
    return family == EmailFamily.REFERRAL;
  }

  @Override
  public EmailSenderStrategy getEmailSender(EmailType type) {
    return Optional.ofNullable(referralEmailStrategyMap.get(type))
        .orElseThrow(() -> new IllegalArgumentException("No email sender for referral type: " + type));
  }
}