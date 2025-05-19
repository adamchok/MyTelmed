package com.mytelmed.controller;

import com.mytelmed.advice.exception.EmailAlreadyUsedException;
import com.mytelmed.advice.exception.TokenRefreshException;
import com.mytelmed.model.dto.request.reset.EmailResetRequestDto;
import com.mytelmed.model.dto.request.verification.EmailVerificationRequestDto;
import com.mytelmed.model.dto.request.reset.PasswordResetRequestDto;
import com.mytelmed.model.dto.response.JwtResponseDto;
import com.mytelmed.model.dto.request.LoginRequestDto;
import com.mytelmed.model.dto.request.RefreshTokenDto;
import com.mytelmed.model.dto.request.RegistrationRequestDto;
import com.mytelmed.model.dto.request.verification.CodeVerificationRequestDto;
import com.mytelmed.model.dto.response.StandardResponseDto;
import com.mytelmed.model.entity.security.RefreshToken;
import com.mytelmed.model.entity.security.User;
import com.mytelmed.service.security.EmailResetService;
import com.mytelmed.service.security.JwtService;
import com.mytelmed.service.PatientService;
import com.mytelmed.service.security.PasswordResetService;
import com.mytelmed.service.security.RefreshTokenService;
import com.mytelmed.service.security.VerificationService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.UUID;


@Slf4j
@RestController
@RequestMapping("/auth")
public class AuthenticationController {
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final RefreshTokenService refreshTokenService;
    private final PatientService patientService;
    private final VerificationService verificationService;
    private final PasswordResetService passwordResetService;
    private final EmailResetService emailResetService;

    public AuthenticationController(PatientService patientService, JwtService jwtService,
                                    AuthenticationManager authenticationManager,
                                    RefreshTokenService refreshTokenService, VerificationService verificationService,
                                    PasswordResetService passwordResetService,
                                    EmailResetService emailResetService) {
        this.patientService = patientService;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.refreshTokenService = refreshTokenService;
        this.verificationService = verificationService;
        this.passwordResetService = passwordResetService;
        this.emailResetService = emailResetService;
    }

    @PostMapping("/login")
    public JwtResponseDto login(@Valid @RequestBody LoginRequestDto loginRequest) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.username(), loginRequest.password())
        );
        RefreshToken refreshToken = refreshTokenService.createOrGetRefreshToken(loginRequest.username());
        return JwtResponseDto.builder()
                .accessToken(jwtService.generateAccessToken(loginRequest.username()))
                .refreshToken(refreshToken.getToken())
                .build();
    }

    @PostMapping("/refresh-token")
    public JwtResponseDto refreshToken(@RequestBody RefreshTokenDto body) {
        return refreshTokenService.findByToken(body.refreshToken())
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(userInfo -> {
                    String accessToken = jwtService.generateAccessToken(userInfo.getUsername());
                    return JwtResponseDto.builder()
                            .accessToken(accessToken)
                            .refreshToken(body.refreshToken())
                            .build();
                })
                .orElseThrow(() -> new TokenRefreshException("Refresh token not found"));
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(@AuthenticationPrincipal User auth) {
        UUID userID = auth.getId();
        refreshTokenService.deleteRefreshTokenByUserId(userID);
        return ResponseEntity.ok("Logout successful.");
    }

    @PostMapping("/register")
    public ResponseEntity<StandardResponseDto> register(@Valid @RequestBody RegistrationRequestDto registrationRequestDto) {
        try {
            patientService.createPatientAccount(registrationRequestDto);

            StandardResponseDto response = StandardResponseDto.builder()
                    .isSuccess(true)
                    .message("Registration successful.")
                    .build();

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            StandardResponseDto response = StandardResponseDto.builder()
                    .isSuccess(false)
                    .message("An unexpected error occurred during registration.")
                    .build();

            log.error("Error registering user: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/verify/send")
    public ResponseEntity<StandardResponseDto> sendVerificationCode(@RequestBody EmailVerificationRequestDto request) {
        String email = request.email();

        if (patientService.isPatientEmailExists(email)) {
            throw new EmailAlreadyUsedException("An account with this email address already exists. Please use a different email or try logging in.");
        }

        verificationService.sendVerificationCode(email);

        StandardResponseDto emailRequestDto = StandardResponseDto.builder()
                .isSuccess(true)
                .message("Verification code sent to email")
                .build();

        return ResponseEntity.ok(emailRequestDto);
    }

    @PostMapping("/verify")
    public ResponseEntity<StandardResponseDto> verifyEmail(@RequestBody CodeVerificationRequestDto request) {
        boolean verified = verificationService.verifyEmail(request.email(), request.token());

        StandardResponseDto codeVerificationResponseDto = StandardResponseDto.builder()
                .isSuccess(verified)
                .message(verified ? "Email successfully verified" : "Invalid or expired verification code")
                .build();

        if (!verified) {
            return ResponseEntity.badRequest().body(codeVerificationResponseDto);
        }

        return ResponseEntity.ok(codeVerificationResponseDto);
    }

    @PostMapping("/password/reset/request")
    public ResponseEntity<StandardResponseDto> requestPasswordReset(
            @Valid @RequestBody PasswordResetRequestDto request) {
        try {
            passwordResetService.initiatePasswordReset(request.email(), request.nric());
            return ResponseEntity.ok(StandardResponseDto.builder()
                    .isSuccess(true)
                    .message("Password reset link has been sent to your email")
                    .build());
        } catch (Exception e) {
            log.error("Error in password reset request: {}", e.getMessage());
            return ResponseEntity.ok(StandardResponseDto.builder()
                    .isSuccess(true)
                    .message("If your email is registered with us, you will receive a password reset link")
                    .build());
        }
    }

    @PostMapping("/password/reset/{token}")
    public ResponseEntity<StandardResponseDto> resetPassword(
            @PathVariable String token,
            @RequestBody String newPassword) {
        try {
            passwordResetService.resetPassword(token, newPassword);
            return ResponseEntity.ok(StandardResponseDto.builder()
                    .isSuccess(true)
                    .message("Password has been reset successfully")
                    .build());
        } catch (Exception e) {
            log.error("Error in password reset: {}", e.getMessage());
            return ResponseEntity.badRequest().body(StandardResponseDto.builder()
                    .isSuccess(false)
                    .message("Invalid or expired reset link")
                    .build());
        }
    }

    @PostMapping("/email/reset/request")
    public ResponseEntity<StandardResponseDto> requestEmailReset(
            @Valid @RequestBody EmailResetRequestDto request) {
        emailResetService.initiateEmailReset(request.nric(), request.phone(), request.serialNumber(), request.name(), request.email());
        return ResponseEntity.ok(StandardResponseDto.builder()
                .isSuccess(true)
                .message("Password reset link has been sent to your email")
                .build());
    }

    @PostMapping("/email/reset/{token}")
    public ResponseEntity<StandardResponseDto> resetEmail(
            @PathVariable String token,
            @RequestBody String newEmail) {
        try {
            emailResetService.resetEmail(token, newEmail);
            return ResponseEntity.ok(StandardResponseDto.builder()
                    .isSuccess(true)
                    .message("Email has been reset successfully.")
                    .build());
        } catch (Exception e) {
            log.error("Error in email reset: {}", e.getMessage());
            return ResponseEntity.badRequest().body(StandardResponseDto.builder()
                    .isSuccess(false)
                    .message("Invalid or expired reset link.")
                    .build());
        }
    }
}
