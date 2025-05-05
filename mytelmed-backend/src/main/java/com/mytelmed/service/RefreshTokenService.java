package com.mytelmed.service;

import com.mytelmed.exception.TokenExpiredException;
import com.mytelmed.model.entity.RefreshToken;
import com.mytelmed.model.entity.User;
import com.mytelmed.repository.RefreshTokenRepository;
import com.mytelmed.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;
import java.util.Optional;


@Slf4j
@Service
public class RefreshTokenService {
    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;
    private final long refreshTokenExpirationDuration;

    public RefreshTokenService(
            RefreshTokenRepository refreshTokenRepository,
            UserRepository userRepository,
            @Value("${application.security.jwt.refresh-token-expiration}") long refreshTokenExpirationDuration) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.userRepository = userRepository;
        this.refreshTokenExpirationDuration = refreshTokenExpirationDuration;
    }

    public RefreshToken createOrGetRefreshToken(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new UsernameNotFoundException("User not found: " + username)
                );
        return refreshTokenRepository.findByUserId(user.getId())
                .orElseGet(() -> createRefreshToken(user));
    }

    public RefreshToken createRefreshToken(User user) {
        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(UUID.randomUUID().toString())
                .expiredAt(Instant.now().plus(refreshTokenExpirationDuration, ChronoUnit.MINUTES))
                .build();
        return refreshTokenRepository.save(refreshToken);
    }

    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }

    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.getExpiredAt().compareTo(Instant.now()) < 0) {
            refreshTokenRepository.delete(token);
            throw new TokenExpiredException("Refresh token was expired. Please make a new login request.");
        }
        return token;
    }

    public void deleteRefreshTokenByUserId(UUID userId) {
        refreshTokenRepository.deleteByUserId(userId);
    }
}
