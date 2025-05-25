package com.mytelmed.common.advice.exception;

import com.mytelmed.common.advice.AppException;
import com.mytelmed.common.constants.ErrorCode;


public class UsernameAlreadyExistException extends AppException {
    public UsernameAlreadyExistException(String message) {
        super(message, ErrorCode.USERNAME_ALREADY_EXIST);
    }
}
