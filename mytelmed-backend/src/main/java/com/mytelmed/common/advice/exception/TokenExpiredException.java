package com.mytelmed.common.advice.exception;

import com.mytelmed.common.advice.AppException;
import com.mytelmed.common.constant.ErrorCode;


public class TokenExpiredException extends AppException {
    public TokenExpiredException(String message) {
        super(message, ErrorCode.TOKEN_EXPIRED);
    }
}
