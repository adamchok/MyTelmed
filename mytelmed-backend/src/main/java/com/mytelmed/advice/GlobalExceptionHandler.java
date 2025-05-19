package com.mytelmed.advice;

import com.mytelmed.advice.exception.EmailAlreadyUsedException;
import com.mytelmed.advice.exception.EmailSendingException;
import com.mytelmed.advice.exception.InvalidCredentialsException;
import com.mytelmed.advice.exception.TokenExpiredException;
import com.mytelmed.advice.exception.TokenRefreshException;
import com.mytelmed.advice.exception.UnverifiedEmailException;
import com.mytelmed.advice.exception.UserAlreadyExistsException;
import com.mytelmed.model.dto.response.StandardResponseDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;


@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
    @ExceptionHandler({UserAlreadyExistsException.class, UnverifiedEmailException.class})
    public ResponseEntity<StandardResponseDto> handleUserAlreadyExistsException(UserAlreadyExistsException ex) {
        StandardResponseDto response = StandardResponseDto.builder()
                .isSuccess(false)
                .message(ex.getMessage())
                .build();
        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    }

    @ExceptionHandler({EmailAlreadyUsedException.class, EmailSendingException.class})
    public ResponseEntity<StandardResponseDto> handleEmailAlreadyUsedException(RuntimeException ex) {
        if (ex instanceof EmailSendingException) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(StandardResponseDto.builder()
                    .isSuccess(false)
                    .message("Failed to send email.")
                    .build());
        }
        return ResponseEntity.status(HttpStatus.CONFLICT).body(StandardResponseDto.builder()
                .isSuccess(false)
                .message(ex.getMessage())
                .build());
    }

    @ExceptionHandler(TokenExpiredException.class)
    public ResponseEntity<String> handleTokenExpiredException(TokenExpiredException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ex.getMessage());
    }

    @ExceptionHandler(TokenRefreshException.class)
    public ResponseEntity<String> handleTokenRefreshException(TokenRefreshException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ex.getMessage());
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<StandardResponseDto> handleTokenRefreshException(InvalidCredentialsException ex) {
        log.error("Invalid Credentials Exception: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(StandardResponseDto.builder()
                .isSuccess(false)
                .message("Invalid credentials or input")
                .build());
    }
}