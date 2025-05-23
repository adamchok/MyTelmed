package com.mytelmed.common.advice.exception;

import com.mytelmed.common.advice.AppException;
import com.mytelmed.common.constants.ErrorCode;


public class EmailSendingException extends AppException {
    public EmailSendingException(String message) {
        super(message, ErrorCode.EMAIL_SENDING_FAILED);
    }
}
