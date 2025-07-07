package com.mytelmed.common.advice;

import com.mytelmed.common.constant.ErrorCode;
import lombok.Getter;


@Getter
public class AppException extends RuntimeException {
    private ErrorCode errorCode;

    public AppException(String message, ErrorCode errorCode) {
        super(message);
        this.errorCode = errorCode;
    }

    public AppException(String message) {
        super(message);
    }
}
