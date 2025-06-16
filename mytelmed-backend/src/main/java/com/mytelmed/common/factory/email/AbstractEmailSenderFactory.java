package com.mytelmed.common.factory.email;

import com.mytelmed.common.constants.email.EmailFamily;
import com.mytelmed.common.constants.email.EmailType;
import com.mytelmed.infrastructure.email.strategy.EmailSenderStrategy;


public interface AbstractEmailSenderFactory {
    boolean supports(EmailFamily family);

    EmailSenderStrategy getEmailSender(EmailType type);
}
