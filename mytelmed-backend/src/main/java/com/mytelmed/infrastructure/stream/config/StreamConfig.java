package com.mytelmed.infrastructure.stream.config;

import io.getstream.services.framework.StreamSDKClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;


@Configuration
public class StreamConfig {
    private final String API_KEY;
    private final String API_SECRET;

    public StreamConfig(
            @Value("${stream.api.key}") String apiKey,
            @Value("${stream.api.secret}") String apiSecret) {
        this.API_KEY = apiKey;
        this.API_SECRET = apiSecret;
    }

    @Bean
    public StreamSDKClient streamSDKClient() {
        return new StreamSDKClient(API_KEY, API_SECRET);
    }
}
