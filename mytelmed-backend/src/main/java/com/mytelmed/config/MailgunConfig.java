package com.mytelmed.config;

import com.mailgun.api.v3.MailgunMessagesApi;
import com.mailgun.client.MailgunClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;


@Configuration
public class MailgunConfig {
    private final String MAIL_GUN_API_KEY;

    public MailgunConfig(@Value("${mailgun.api.key}") String MAIL_GUN_API_KEY) {
        this.MAIL_GUN_API_KEY = MAIL_GUN_API_KEY;
    }

    @Bean
    public MailgunMessagesApi mailgunMessagesApi() {
        return MailgunClient.config(MAIL_GUN_API_KEY)
                .createAsyncApi(MailgunMessagesApi.class);
    }
}
