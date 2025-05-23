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
import java.util.UUID;


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
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.username(), loginRequest.password())
        );

        String accessToken = jwtService.generateAccessToken(loginRequest.username());
        String refreshToken = refreshTokenService.createOrGetRefreshToken(loginRequest.username()).getToken();

        JwtDto jwtDto = JwtDto.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
        return ResponseEntity.ok(ApiResponse.success(jwtDto));
    }

    @PostMapping("/token/refresh")
    public ResponseEntity<ApiResponse<JwtDto>> refreshToken(@RequestBody RefreshTokenRequestDto request) {
        return refreshTokenService.findByToken(request.refreshToken())
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getAccount)
                .map(accountInfo -> {
                    String accessToken = jwtService.generateAccessToken(accountInfo.getUsername());
                    String refreshToken = request.refreshToken();

                    JwtDto jwtDto =  JwtDto.builder()
                            .accessToken(accessToken)
                            .refreshToken(refreshToken)
                            .build();
                    return ResponseEntity.ok(ApiResponse.success(jwtDto));
                })
                .orElseThrow(() -> {
                    log.warn("Refresh token not found for token: {}", request.refreshToken());
                    return new ResourceNotFoundException("Refresh token not found, please login again");
                });
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(@AuthenticationPrincipal Account auth) {
        UUID accountId = auth.getId();
        refreshTokenService.deleteRefreshTokenByAccountId(accountId);
        return ResponseEntity.ok(ApiResponse.success("Logout successful"));
    }
}
