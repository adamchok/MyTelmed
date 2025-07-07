package com.mytelmed.core.verification.controller;

import com.mytelmed.common.dto.ApiResponse;
import com.mytelmed.core.verification.dto.SendVerificationEmailRequestDto;
import com.mytelmed.core.verification.service.EmailVerificationService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@Slf4j
@RestController
@RequestMapping("/api/v1/verification")
public class VerificationController {
    private final EmailVerificationService emailVerificationService;

    public VerificationController(EmailVerificationService emailVerificationService) {
        this.emailVerificationService = emailVerificationService;
    }

    /**
     * Send verification email to the specified email address
     */
    @PostMapping("/send")
    public ResponseEntity<ApiResponse<Void>> sendVerificationEmail(
            @Valid @RequestBody SendVerificationEmailRequestDto request) {
        log.debug("Received request to send verification email to: {}", request.email());

        emailVerificationService.sendVerificationEmail(request.email());

        return ResponseEntity.ok(ApiResponse.success("Verification email sent successfully"));
    }

    /**
     * Verify email using the provided token
     */
    @PostMapping("/verify/{token}")
    public ResponseEntity<ApiResponse<Void>> verifyEmail(@PathVariable String token) {
        log.debug("Received request to verify email with token: {}", token);

        emailVerificationService.verifyEmail(token);

        return ResponseEntity.ok(ApiResponse.success("Email verified successfully"));
    }
}
