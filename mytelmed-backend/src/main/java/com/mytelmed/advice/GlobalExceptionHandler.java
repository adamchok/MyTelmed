package com.mytelmed.advice;

import com.mytelmed.advice.exception.EmailAlreadyUsedException;
import com.mytelmed.advice.exception.EmailSendingException;
import com.mytelmed.advice.exception.TokenExpiredException;
import com.mytelmed.advice.exception.TokenRefreshException;
import com.mytelmed.advice.exception.UnverifiedEmailException;
import com.mytelmed.advice.exception.UserAlreadyExistsException;
import com.mytelmed.model.dto.response.EmailVerificationResponseDto;
import com.mytelmed.model.dto.response.RegistrationResponseDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;


@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler({UserAlreadyExistsException.class, UnverifiedEmailException.class})
    public ResponseEntity<RegistrationResponseDto> handleUserAlreadyExistsException(UserAlreadyExistsException ex) {
        RegistrationResponseDto response = RegistrationResponseDto.builder()
                .isSuccess(false)
                .message(ex.getMessage())
                .build();
        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    }

    @ExceptionHandler({EmailAlreadyUsedException.class, EmailSendingException.class})
    public ResponseEntity<EmailVerificationResponseDto> handleEmailAlreadyUsedException(RuntimeException ex) {
        if (ex instanceof EmailSendingException) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(EmailVerificationResponseDto.builder()
                    .isSuccess(false)
                    .message("Failed to send email.")
                    .build());
        }
        return ResponseEntity.status(HttpStatus.CONFLICT).body(EmailVerificationResponseDto.builder()
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
}