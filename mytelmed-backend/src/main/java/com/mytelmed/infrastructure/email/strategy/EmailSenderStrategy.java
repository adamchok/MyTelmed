package com.mytelmed.infrastructure.email.strategy;

import com.mytelmed.infrastructure.email.constant.EmailType;
import java.util.Map;


public interface EmailSenderStrategy {
    EmailType getEmailType();

    void sendEmail(String to, Map<String, Object> variables);
}
