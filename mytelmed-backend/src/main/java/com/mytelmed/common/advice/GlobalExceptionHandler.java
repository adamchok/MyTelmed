package com.mytelmed.common.advice;

import com.mytelmed.common.constants.ErrorCode;
import com.mytelmed.common.dto.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;


@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponse<Void>> handleAppException(AppException ex) {
        HttpStatus status = switch (ex.getErrorCode()) {
            case ErrorCode.RESOURCE_NOT_FOUND, ErrorCode.INVALID_INPUT, ErrorCode.INVALID_CREDENTIALS -> HttpStatus.BAD_REQUEST;
            case ErrorCode.TOKEN_EXPIRED -> HttpStatus.UNAUTHORIZED;
            case ErrorCode.EMAIL_SENDING_FAILED -> HttpStatus.INTERNAL_SERVER_ERROR;
        };

        return new ResponseEntity<>(
                ApiResponse.failure(ex.getMessage()),
                status
        );
    }

    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleUsernameNotFound(UsernameNotFoundException ex) {
        return new ResponseEntity<>(
                ApiResponse.failure("Invalid username or password"),
                HttpStatus.INTERNAL_SERVER_ERROR
        );
    }
}
