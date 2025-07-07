package com.mytelmed.common.advice.exception;

import com.mytelmed.common.advice.AppException;
import com.mytelmed.common.constant.ErrorCode;


public class InvalidInputException extends AppException {
    public InvalidInputException(String message) {
        super(message, ErrorCode.INVALID_INPUT);
    }
}
