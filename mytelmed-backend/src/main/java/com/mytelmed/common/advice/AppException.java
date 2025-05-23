package com.mytelmed.common.advice;

import com.mytelmed.common.constants.ErrorCode;
import lombok.Getter;


@Getter
public class AppException extends RuntimeException {
    private final ErrorCode errorCode;

    public AppException(String message, ErrorCode errorCode) {
        super(message);
        this.errorCode = errorCode;
    }
}
