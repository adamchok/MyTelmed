package com.mytelmed.infrastructure.push.factory;

import com.mytelmed.infrastructure.push.constant.PushNotificationFamily;
import com.mytelmed.infrastructure.push.constant.PushNotificationType;
import com.mytelmed.infrastructure.push.strategy.PushNotificationStrategy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
public class PushNotificationFactoryRegistry {
    private final Map<PushNotificationFamily, AbstractPushNotificationFactory> factoryCache;

    public PushNotificationFactoryRegistry(List<AbstractPushNotificationFactory> factories) {
        this.factoryCache = new ConcurrentHashMap<>();

        factories.forEach(factory -> {
            for (PushNotificationFamily family : PushNotificationFamily.values()) {
                if (factory.supports(family)) {
                    factoryCache.put(family, factory);
                    log.info("Registered push notification factory {} for family {}",
                            factory.getClass().getSimpleName(), family);
                }
            }
        });

        validateFactoryRegistration();
    }

    @Cacheable(value = "pushNotificationStrategies", key = "#notificationType")
    public PushNotificationStrategy getNotificationSender(PushNotificationType notificationType) {
        PushNotificationFamily family = notificationType.getFamily();
        AbstractPushNotificationFactory factory = getFactory(family);
        return factory.getNotificationSender(notificationType);
    }

    public AbstractPushNotificationFactory getFactory(PushNotificationFamily family) {
        AbstractPushNotificationFactory factory = factoryCache.get(family);
        if (factory == null) {
            throw new IllegalArgumentException("No push notification factory found for family: " + family);
        }
        return factory;
    }

    public boolean hasFactory(PushNotificationFamily family) {
        return factoryCache.containsKey(family);
    }

    private void validateFactoryRegistration() {
        for (PushNotificationFamily family : PushNotificationFamily.values()) {
            if (!factoryCache.containsKey(family)) {
                log.warn("No push notification factory registered for notification family: {}", family);
            }
        }

        log.info("Initialized PushNotificationFactoryRegistry with {} factories", factoryCache.size());
    }
}
