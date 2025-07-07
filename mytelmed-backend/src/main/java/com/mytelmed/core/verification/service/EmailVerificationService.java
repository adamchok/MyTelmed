package com.mytelmed.core.verification.service;

import com.mytelmed.common.advice.AppException;
import com.mytelmed.common.advice.exception.InvalidCredentialsException;
import com.mytelmed.common.event.verify.model.EmailVerificationEvent;
import com.mytelmed.core.auth.service.AccountService;
import com.mytelmed.core.verification.entity.VerificationToken;
import com.mytelmed.core.verification.repository.VerificationTokenRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;


@Slf4j
@Service
public class EmailVerificationService {
    private final long tokenExpirationMinutes;
    private final VerificationTokenRepository verificationTokenRepository;
    private final ApplicationEventPublisher eventPublisher;

    public EmailVerificationService(
            VerificationTokenRepository verificationTokenRepository,
            AccountService accountService,
            ApplicationEventPublisher eventPublisher,
            @Value("${security.email.verification.expiration}") long tokenExpiration) {
        this.verificationTokenRepository = verificationTokenRepository;
        this.eventPublisher = eventPublisher;
        this.tokenExpirationMinutes = tokenExpiration;
    }

    /**
     * Sends email verification email
     */
    @Transactional
    public void sendVerificationEmail(String email) throws AppException {
        log.debug("Sending verification email to: {}", email);

        try {
            // Create a verification token with email
            VerificationToken token = createVerificationToken(email);

            // Send verification email
            EmailVerificationEvent event = EmailVerificationEvent.builder()
                    .email(email)
                    .token(token.getToken())
                    .build();

            eventPublisher.publishEvent(event);

            log.info("Verification email event published for: {}", email);
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error sending verification email: {}", e.getMessage(), e);
            throw new AppException("Failed to send verification email");
        }
    }

    /**
     * Verifies email using the provided token
     */
    @Transactional
    public void verifyEmail(String token) throws AppException {
        log.debug("Verifying email with token: {}", token);

        // Validate verification token
        if (!validateVerificationToken(token)) {
            throw new InvalidCredentialsException("Invalid or expired verification token");
        }

        log.debug("Verification token {} is validated successfully", token);

        try {
            // Delete the verification token
            verificationTokenRepository.deleteByToken(token);

            log.info("Email verified successfully with token: {}", token);
        } catch (Exception e) {
            log.error("Error verifying email: {}", e.getMessage(), e);
            throw new AppException("Failed to verify email");
        }
    }

    /**
     * Creates a verification token for email verification
     */
    @Transactional
    protected VerificationToken createVerificationToken(String email) {
        // Delete any existing verification tokens for this account
        verificationTokenRepository.deleteByEmail(email);

        // Generate a new verification token
        String token = generateVerificationToken();
        VerificationToken verificationToken = VerificationToken.builder()
                .email(email)
                .token(token)
                .expiredAt(Instant.now().plus(tokenExpirationMinutes, ChronoUnit.MINUTES))
                .build();

        // Save verification token
        return verificationTokenRepository.save(verificationToken);
    }

    /**
     * Validates a verification token
     */
    @Transactional(readOnly = true)
    protected boolean validateVerificationToken(String token) {
        log.debug("Validating verification token: {}", token);

        return verificationTokenRepository.findByToken(token)
                .filter(verificationToken -> verificationToken.getExpiredAt().isAfter(Instant.now()))
                .isPresent();
    }

    /**
     * Generates a random verification token
     */
    private String generateVerificationToken() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 6).toUpperCase();
    }
}