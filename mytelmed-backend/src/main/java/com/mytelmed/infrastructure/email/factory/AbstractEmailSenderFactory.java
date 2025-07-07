package com.mytelmed.infrastructure.email.factory;

import com.mytelmed.infrastructure.email.constant.EmailFamily;
import com.mytelmed.infrastructure.email.constant.EmailType;
import com.mytelmed.infrastructure.email.strategy.EmailSenderStrategy;


public interface AbstractEmailSenderFactory {
    boolean supports(EmailFamily family);

    EmailSenderStrategy getEmailSender(EmailType type);
}
