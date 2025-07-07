package com.mytelmed.common.advice.exception;

import com.mytelmed.common.advice.AppException;
import com.mytelmed.common.constant.ErrorCode;


public class ResourceNotFoundException extends AppException {
    public ResourceNotFoundException(String message) {
        super(message, ErrorCode.RESOURCE_NOT_FOUND);
    }
}
