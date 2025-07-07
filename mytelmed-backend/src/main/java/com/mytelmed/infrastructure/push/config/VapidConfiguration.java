package com.mytelmed.infrastructure.push.config;

import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;
import java.security.Security;


@Slf4j
@Getter
@Configuration
public class VapidConfiguration {
    @Value("${application.push.vapid.subject}")
    private String vapidSubject;

    @Value("${application.push.vapid.public.key}")
    private String vapidPublicKey;

    @Value("${application.push.vapid.private.key}")
    private String vapidPrivateKey;

    @Value("${application.push.enabled}")
    private boolean pushNotificationsEnabled;

    @PostConstruct
    public void initializeVapidKeys() {
        if (Security.getProvider(BouncyCastleProvider.PROVIDER_NAME) == null) {
            Security.addProvider(new BouncyCastleProvider());
        }

        if (!StringUtils.hasText(vapidPublicKey) || !StringUtils.hasText(vapidPrivateKey)) {
            log.warn("VAPID keys not found in configuration.");
            log.warn("IMPORTANT: Add these VAPID keys to your environment variables:");
            throw new IllegalStateException("VAPID keys not found in configuration.");
        }

        log.info("VAPID configuration initialized. Push notifications enabled: {}", pushNotificationsEnabled);
    }
}
