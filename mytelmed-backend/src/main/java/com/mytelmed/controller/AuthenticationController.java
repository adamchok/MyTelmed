package com.mytelmed.controller;

import com.mytelmed.exception.TokenRefreshException;
import com.mytelmed.model.dto.JwtResponseDto;
import com.mytelmed.model.dto.LoginRequestDto;
import com.mytelmed.model.dto.RefreshTokenDto;
import com.mytelmed.model.entity.RefreshToken;
import com.mytelmed.model.entity.User;
import com.mytelmed.service.JwtService;
import com.mytelmed.service.RefreshTokenService;
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
@RequestMapping("/auth")
public class AuthenticationController {
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final RefreshTokenService refreshTokenService;

    public AuthenticationController(JwtService jwtService, AuthenticationManager authenticationManager, RefreshTokenService refreshTokenService) {
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.refreshTokenService = refreshTokenService;
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
}
