package com.mytelmed.infrastructure.push.config;

import com.mytelmed.infrastructure.push.factory.AbstractPushNotificationFactory;
import com.mytelmed.infrastructure.push.factory.appointment.AppointmentPushNotificationFactory;
import com.mytelmed.infrastructure.push.factory.delivery.DeliveryPushNotificationFactory;
import com.mytelmed.infrastructure.push.factory.prescription.PrescriptionPushNotificationFactory;
import com.mytelmed.infrastructure.push.strategy.PushNotificationStrategy;
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
public class PushNotificationFactoryConfig {
    @Bean
    public AppointmentPushNotificationFactory appointmentPushNotificationFactory(List<PushNotificationStrategy> strategies) {
        log.info("Registering AppointmentPushNotificationFactory with {} total strategies", strategies.size());
        return new AppointmentPushNotificationFactory(strategies);
    }

    @Bean
    public PrescriptionPushNotificationFactory prescriptionPushNotificationFactory(List<PushNotificationStrategy> strategies) {
        log.info("Registering PrescriptionPushNotificationFactory with {} total strategies", strategies.size());
        return new PrescriptionPushNotificationFactory(strategies);
    }

    @Bean
    public DeliveryPushNotificationFactory deliveryPushNotificationFactory(List<PushNotificationStrategy> strategies) {
        log.info("Registering DeliveryPushNotificationFactory with {} total strategies", strategies.size());
        return new DeliveryPushNotificationFactory(strategies);
    }

    @Bean
    @Primary
    public Map<String, AbstractPushNotificationFactory> pushFactoryRegistry(List<AbstractPushNotificationFactory> factories) {
        Map<String, AbstractPushNotificationFactory> registry = factories.stream()
                .collect(Collectors.toMap(
                        factory -> factory.getClass().getSimpleName(),
                        Function.identity()));

        log.info("Registered {} push notification sender factories: {}", registry.size(), registry.keySet());
        return registry;
    }
}
