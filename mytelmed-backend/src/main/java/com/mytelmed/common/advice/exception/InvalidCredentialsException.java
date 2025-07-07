package com.mytelmed.common.advice.exception;

import com.mytelmed.common.advice.AppException;
import com.mytelmed.common.constant.ErrorCode;


public class InvalidCredentialsException extends AppException {
    public InvalidCredentialsException(String message) {
        super(message, ErrorCode.INVALID_CREDENTIALS);
    }
}
