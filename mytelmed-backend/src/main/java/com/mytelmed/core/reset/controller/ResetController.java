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
        passwordResetService.initiatePasswordReset(request);
        return ResponseEntity.ok(ApiResponse.success("Password reset link sent successfully"));
    }

    @PostMapping("/password/{token}")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@PathVariable String token,
                                                 @RequestBody ResetPasswordRequestDto request) {
        passwordResetService.resetPassword(token, request);
        return ResponseEntity.ok(ApiResponse.success("Password reset successfully"));
    }

    @PostMapping("/email/initiate")
    public ResponseEntity<ApiResponse<Void>> initiateEmailReset(@RequestBody InitiateEmailResetRequestDto request) {
        emailResetService.initiateEmailReset(request);
        return ResponseEntity.ok(ApiResponse.success("Email reset link sent successfully"));
    }

    @PostMapping("/email/{token}")
    public ResponseEntity<ApiResponse<Void>> resetEmail(@PathVariable String token, @RequestBody ResetEmailRequestDto request) {
        emailResetService.resetEmail(token, request);
        return ResponseEntity.ok(ApiResponse.success("Email reset successfully"));
    }
}
