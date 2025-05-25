package com.mytelmed.core.reset.controller;

import com.mytelmed.common.dto.ApiResponse;
import com.mytelmed.core.reset.dto.InitiateEmailResetRequestDto;
import com.mytelmed.core.reset.dto.InitiatePasswordResetRequestDto;
import com.mytelmed.core.reset.dto.ResetEmailRequestDto;
import com.mytelmed.core.reset.dto.ResetPasswordRequestDto;
import com.mytelmed.core.reset.service.EmailResetService;
import com.mytelmed.core.reset.service.PasswordResetService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/api/v1/reset")
public class ResetController {
    private final EmailResetService emailResetService;
    private final PasswordResetService passwordResetService;

    public ResetController(EmailResetService emailResetService, PasswordResetService passwordResetService) {
        this.emailResetService = emailResetService;
        this.passwordResetService = passwordResetService;
    }

    @PostMapping("/password/initiate")
    public ResponseEntity<ApiResponse<Void>> initiatePasswordReset(@RequestBody InitiatePasswordResetRequestDto request) {
        boolean result = passwordResetService.initiatePasswordReset(request);

        if (result) {
            return ResponseEntity.ok(ApiResponse.success("Password reset link sent successfully"));
        } else {
            return ResponseEntity.internalServerError().body(ApiResponse.failure("Failed to send password reset link"));
        }
    }

    @PostMapping("/password/{token}")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@PathVariable String token,
                                                 @RequestBody ResetPasswordRequestDto request) {
        boolean result = passwordResetService.resetPassword(token, request);

        if (result) {
            return ResponseEntity.ok(ApiResponse.success("Password reset successfully"));
        } else {
            return ResponseEntity.internalServerError().body(ApiResponse.failure("Failed to reset password"));
        }
    }

    @PostMapping("/email/initiate")
    public ResponseEntity<ApiResponse<Void>> initiateEmailReset(@RequestBody InitiateEmailResetRequestDto request) {
        boolean result = emailResetService.initiateEmailReset(request);

        if (result) {
            return ResponseEntity.ok(ApiResponse.success("Email reset link sent successfully"));
        } else {
            return ResponseEntity.internalServerError().body(ApiResponse.failure("Failed to send email reset link"));
        }
    }

    @PostMapping("/email/{token}")
    public ResponseEntity<ApiResponse<Void>> resetEmail(@PathVariable String token,
                                              @RequestBody ResetEmailRequestDto request) {
        boolean result = emailResetService.resetEmail(token, request);

        if (result) {
            return ResponseEntity.ok(ApiResponse.success("Email reset successfully"));
        } else {
            return ResponseEntity.internalServerError().body(ApiResponse.failure("Failed to reset email"));
        }
    }
}
