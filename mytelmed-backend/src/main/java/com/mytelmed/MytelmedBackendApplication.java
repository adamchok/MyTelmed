package com.mytelmed;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.web.config.EnableSpringDataWebSupport;


@SpringBootApplication
public class MytelmedBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(MytelmedBackendApplication.class, args);
    }
}
