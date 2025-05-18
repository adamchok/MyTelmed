package com.mytelmed.service.security;

import com.mytelmed.model.entity.security.VerificationToken;
import com.mytelmed.repository.VerificationTokenRepository;
import com.mytelmed.service.EmailService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.security.SecureRandom;
import java.time.LocalDateTime;


@Service
public class VerificationService {
    private final SecureRandom secureRandom = new SecureRandom();
    private final VerificationTokenRepository tokenRepository;
    private final EmailService emailService;
    private final long tokenExpirationMinutes;

    public VerificationService(VerificationTokenRepository tokenRepository, EmailService emailService,
                               @Value("${application.security.email-verification.expiration-minutes}") long tokenExpirationMinutes) {
        this.tokenRepository = tokenRepository;
        this.emailService = emailService;
        this.tokenExpirationMinutes = tokenExpirationMinutes;
    }

    private String generateSixDigitToken() {
        int token = 100_000 + secureRandom.nextInt(900_000);
        return String.valueOf(token);
    }

    @Transactional
    public void sendVerificationCode(String email) {
        tokenRepository.findByEmail(email).ifPresent(tokenRepository::delete);
        String generatedToken = generateSixDigitToken();
        VerificationToken token = VerificationToken.builder()
                .email(email)
                .token(generatedToken)
                .expiryDate(LocalDateTime.now().plusMinutes(tokenExpirationMinutes))
                .build();
        tokenRepository.save(token);
        emailService.sendVerificationEmail(email, token.getToken());
    }

    @Transactional
    public boolean verifyEmail(String email, String token) {
        return tokenRepository.findByEmailAndToken(email, token)
                .filter(verificationToken -> !verificationToken.isExpired())
                .map(verificationToken -> {
                    verificationToken.setVerified(true);
                    tokenRepository.save(verificationToken);
                    return true;
                })
                .orElse(false);
    }

    public boolean isEmailVerified(String email) {
        return tokenRepository.findByEmail(email)
                .filter(VerificationToken::isVerified)
                .isPresent();
    }
}

