package com.mytelmed.common.advice;

import com.fasterxml.jackson.databind.exc.InvalidFormatException;
import com.mytelmed.common.constants.ErrorCode;
import com.mytelmed.common.dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;


@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {
    private static final Map<ErrorCode, HttpStatus> ERROR_STATUS_MAP = Map.of(
        ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.BAD_REQUEST,
        ErrorCode.INVALID_INPUT, HttpStatus.BAD_REQUEST,
        ErrorCode.INVALID_CREDENTIALS, HttpStatus.BAD_REQUEST,
        ErrorCode.USERNAME_ALREADY_EXIST, HttpStatus.BAD_REQUEST,
        ErrorCode.TOKEN_EXPIRED, HttpStatus.UNAUTHORIZED,
        ErrorCode.EMAIL_SENDING_FAILED, HttpStatus.INTERNAL_SERVER_ERROR
    );

    private HttpStatus resolveHttpStatus(ErrorCode errorCode) {
        return Optional.ofNullable(errorCode)
                .map(ERROR_STATUS_MAP::get)
                .orElse(HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponse<Void>> handleAppException(AppException ex) {
        HttpStatus status = resolveHttpStatus(ex.getErrorCode());
        return new ResponseEntity<>(ApiResponse.failure(ex.getMessage()), status);
    }

    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleUsernameNotFound(UsernameNotFoundException ex) {
        HttpStatus status = HttpStatus.UNAUTHORIZED;
        return new ResponseEntity<>(ApiResponse.failure("Invalid username or password"), status);
    }

    @ExceptionHandler(InvalidFormatException.class)
    public ResponseEntity<ApiResponse<Void>> handleInvalidEnum(InvalidFormatException ex) {
        String fieldName = ex.getPath().get(0).getFieldName();
        String invalidValue = ex.getValue().toString();
        log.error("Invalid enum value '{}' for field '{}'", invalidValue, fieldName, ex);
        return ResponseEntity.badRequest().body(ApiResponse.failure("Invalid request inputs"));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationErrors(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();

        ex.getBindingResult().getFieldErrors().forEach(error -> {
            errors.put(error.getField(), error.getDefaultMessage());
        });

        return ResponseEntity.badRequest().body(ApiResponse.failure(errors,"Invalid request inputs"));
    }
}
