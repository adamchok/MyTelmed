package com.mytelmed.core.auth.service;

import com.mytelmed.common.advice.AppException;
import com.mytelmed.common.advice.exception.ResourceNotFoundException;
import com.mytelmed.common.advice.exception.TokenExpiredException;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.auth.entity.RefreshToken;
import com.mytelmed.core.auth.repository.RefreshTokenRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;


@Slf4j
@Service
public class RefreshTokenService {
    private final RefreshTokenRepository refreshTokenRepository;
    private final UserService userService;
    private final long refreshTokenDurationMs;

    public RefreshTokenService(
            RefreshTokenRepository refreshTokenRepository,
            UserService userService,
            @Value("${application.security.jwt.refresh-token-expiration}") long refreshTokenExpirationMin) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.userService = userService;
        this.refreshTokenDurationMs = refreshTokenExpirationMin * 60 * 1000;
    }

    private String maskToken(String token) {
        if (token == null || token.length() < 8) {
            return "***";
        }
        return token.substring(0, 4) + "..." + token.substring(token.length() - 4);
    }

    @Transactional(readOnly = true)
    public RefreshToken findByToken(UUID token) throws AppException {
        log.debug("Looking up refresh token: {}", maskToken(token.toString()));
        return refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> {
                    log.warn("Token not found with token: {}", maskToken(token.toString()));
                    return new ResourceNotFoundException("Token not found");
                });
    }

    @Transactional
    protected RefreshToken createRefreshToken(Account account) {
        UUID tokenValue = UUID.randomUUID();
        Instant expiryDate = Instant.now().plus(refreshTokenDurationMs, ChronoUnit.MILLIS);

        RefreshToken refreshToken = RefreshToken.builder()
                .account(account)
                .token(tokenValue)
                .expiredAt(expiryDate)
                .build();

        RefreshToken savedToken = refreshTokenRepository.save(refreshToken);
        log.debug("Created refresh token for user: {} expiring at: {}", account.getUsername(), expiryDate);

        return savedToken;
    }

    @Transactional
    public RefreshToken createOrGetRefreshToken(String username) throws UsernameNotFoundException {
        log.debug("Creating or retrieving refresh token for user: {}", username);

        try {
            Account account = userService.loadUserByUsername(username);

            Optional<RefreshToken> existingToken = refreshTokenRepository.findByAccountId(account.getId());
            if (existingToken.isPresent()) {
                log.debug("Found existing refresh token for user: {}", username);
                return existingToken.get();
            } else {
                log.info("Creating new refresh token for user: {}", username);
                return createRefreshToken(account);
            }
        } catch (Exception e) {
            log.error("Error creating refresh token for user: {}", username, e);
            throw e;
        }
    }

    @Transactional
    public RefreshToken verifyExpiration(RefreshToken token) throws TokenExpiredException {
        if (token.getExpiredAt().isBefore(Instant.now())) {
            String username = token.getAccount().getUsername();
            log.warn("Refresh token expired for user: {}, token expiry: {}", 
                    username, token.getExpiredAt());
            
            refreshTokenRepository.delete(token);
            throw new TokenExpiredException(
                    String.format("Refresh token expired for user: %s", username));
        }
        
        log.debug("Verified valid refresh token for user: {}", token.getAccount().getUsername());
        return token;
    }

    @Transactional
    public void deleteRefreshTokenByAccountId(UUID accountId) throws AppException {
        log.debug("Deleting refresh token for account ID: {}", accountId);

        try {
            refreshTokenRepository.deleteByAccountId(accountId);
            log.info("Deleted refresh token for account ID: {}", accountId);
        } catch (Exception e) {
            log.error("Error deleting refresh token for user: {}", accountId, e);
            throw new AppException("Failed to logout");
        }
    }
}