package com.mytelmed.core.auth.controller;

import com.mytelmed.common.advice.exception.ResourceNotFoundException;
import com.mytelmed.common.dto.ApiResponse;
import com.mytelmed.core.auth.dto.JwtDto;
import com.mytelmed.core.auth.dto.LoginRequestDto;
import com.mytelmed.core.auth.dto.RefreshTokenRequestDto;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.auth.entity.RefreshToken;
import com.mytelmed.core.auth.service.JwtService;
import com.mytelmed.core.auth.service.RefreshTokenService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
public class AuthenticationController {
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    public AuthenticationController(AuthenticationManager authenticationManager,
                                    JwtService jwtService,
                                    RefreshTokenService refreshTokenService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<JwtDto>> login(@Valid @RequestBody LoginRequestDto loginRequest) {
        log.debug("Received login request for user: {}", loginRequest.username());

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.username(), loginRequest.password())
        );
        log.debug("Authentication successful for user: {}", loginRequest.username());

        try {
            String accessToken = jwtService.generateAccessToken(loginRequest.username());
            String refreshToken = refreshTokenService.createOrGetRefreshToken(loginRequest.username()).getToken().toString();

            JwtDto jwtDto = JwtDto.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .build();

            log.info("Login successful for user: {}", loginRequest.username());
            return ResponseEntity.ok(ApiResponse.success(jwtDto));
        } catch (Exception e) {
            log.error("Failed to login for user: {}", loginRequest.username(), e);
            return ResponseEntity.internalServerError().body(ApiResponse.failure(null, "Failed to login"));
        }
    }

    @PostMapping("/token/refresh")
    public ResponseEntity<ApiResponse<JwtDto>> refreshToken(@Valid @RequestBody RefreshTokenRequestDto request) {
        log.debug("Received refresh token request for user: {}", request.refreshToken());

        return refreshTokenService.findByToken(request.refreshToken())
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getAccount)
                .map(accountInfo -> {
                    String accessToken = jwtService.generateAccessToken(accountInfo.getUsername());
                    String refreshToken = request.refreshToken().toString();

                    JwtDto jwtDto =  JwtDto.builder()
                            .accessToken(accessToken)
                            .refreshToken(refreshToken)
                            .build();

                    log.info("Refresh token successful for user: {}", accountInfo.getUsername());
                    return ResponseEntity.ok(ApiResponse.success(jwtDto));
                })
                .orElseThrow(() -> {
                    log.warn("Refresh token not found for token: {}", request.refreshToken());
                    return new ResourceNotFoundException("Refresh token not found, please login again");
                });
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(@AuthenticationPrincipal Account account) {
        log.info("Received logout request for user: {}", account.getUsername());

        if (refreshTokenService.deleteRefreshTokenByAccountId(account.getId())) {
            log.info("Logout successful for user: {}", account.getUsername());
            return ResponseEntity.ok(ApiResponse.success("Logout successful"));
        } else {
            log.error("Failed to logout for user: {}", account.getUsername());
            return ResponseEntity.internalServerError().body(ApiResponse.failure(null, "Failed to logout"));
        }
    }
}
