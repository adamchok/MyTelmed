package com.mytelmed;

import jakarta.annotation.PostConstruct;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.retry.annotation.EnableRetry;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import java.util.TimeZone;


@SpringBootApplication
@EnableAsync
@EnableScheduling
@EnableRetry
public class MytelmedBackendApplication {
    @PostConstruct
    public void init() {
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Kuala_Lumpur"));
    }

    public static void main(String[] args) {
        SpringApplication.run(MytelmedBackendApplication.class, args);
    }

}
