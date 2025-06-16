package com.mytelmed.infrastructure.email.strategy;

import com.mytelmed.common.constants.email.EmailType;
import java.util.Map;


public interface EmailSenderStrategy {
    EmailType getEmailType();

    void sendEmail(String to, Map<String, Object> variables);
}
