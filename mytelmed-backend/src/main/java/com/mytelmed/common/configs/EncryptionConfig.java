package com.mytelmed.common.configs;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;


@Getter
@Configuration
public class EncryptionConfig {
    @Value("${application.security.encryption.secret-key}")
    private String secretKey;
}
