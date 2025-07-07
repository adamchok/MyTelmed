package com.mytelmed.infrastructure.email.config;

import com.mytelmed.infrastructure.email.factory.AbstractEmailSenderFactory;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;


@Slf4j
@Configuration
public class EmailFactoryConfig {
    @Bean
    @Primary
    public Map<String, AbstractEmailSenderFactory> emailFactoryRegistry(List<AbstractEmailSenderFactory> factories) {
        Map<String, AbstractEmailSenderFactory> registry = factories.stream()
                .collect(Collectors.toMap(
                        factory -> factory.getClass().getSimpleName(),
                        Function.identity()));

        log.info("Registered {} email sender factories: {}", registry.size(), registry.keySet());
        return registry;
    }
}
