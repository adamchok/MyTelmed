package com.mytelmed.infrastructure.email.factory;

import com.mytelmed.infrastructure.email.constant.EmailFamily;
import com.mytelmed.infrastructure.email.constant.EmailType;
import com.mytelmed.infrastructure.email.strategy.EmailSenderStrategy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;


@Slf4j
@Component
public class EmailSenderFactoryRegistry {
    private final Map<EmailFamily, AbstractEmailSenderFactory> factoryCache;

    public EmailSenderFactoryRegistry(List<AbstractEmailSenderFactory> factories) {
        this.factoryCache = new ConcurrentHashMap<>();

        factories.forEach(factory -> {
            for (EmailFamily family : EmailFamily.values()) {
                if (factory.supports(family)) {
                    factoryCache.put(family, factory);
                    log.info("Registered factory {} for family {}",
                            factory.getClass().getSimpleName(), family);
                }
            }
        });

        validateFactoryRegistration();
    }

    @Cacheable(value = "emailStrategies", key = "#emailType")
    public EmailSenderStrategy getEmailSender(EmailType emailType) {
        EmailFamily family = emailType.getFamily();
        AbstractEmailSenderFactory factory = getFactory(family);
        return factory.getEmailSender(emailType);
    }

    public AbstractEmailSenderFactory getFactory(EmailFamily family) {
        AbstractEmailSenderFactory factory = factoryCache.get(family);
        if (factory == null) {
            throw new IllegalArgumentException("No factory found for family: " + family);
        }
        return factory;
    }

    private void validateFactoryRegistration() {
        for (EmailFamily family : EmailFamily.values()) {
            if (!factoryCache.containsKey(family)) {
                log.warn("No factory registered for email family: {}", family);
            }
        }

        log.info("Initialized EmailSenderFactoryRegistry with {} factories", factoryCache.size());
    }
}
