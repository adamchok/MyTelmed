package com.mytelmed.infrastructure.push.config;

import nl.martijndwars.webpush.PushService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;


@Configuration
public class PushServiceConfiguration {
    @Bean
    public PushService pushService(VapidConfiguration vapidConfiguration) {
        try {
            PushService pushService = new PushService();
            pushService.setSubject(vapidConfiguration.getVapidSubject());
            pushService.setPublicKey(vapidConfiguration.getVapidPublicKey());
            pushService.setPrivateKey(vapidConfiguration.getVapidPrivateKey());
            return pushService;
        } catch (Exception e) {
            throw new RuntimeException("Failed to configure PushService", e);
        }
    }
}
