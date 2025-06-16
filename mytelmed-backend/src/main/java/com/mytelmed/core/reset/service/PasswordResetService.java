package com.mytelmed.core.reset.service;

import com.mytelmed.common.advice.AppException;
import com.mytelmed.common.advice.exception.InvalidCredentialsException;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.auth.service.AccountService;
import com.mytelmed.core.patient.entity.Patient;
import com.mytelmed.core.patient.service.PatientService;
import com.mytelmed.core.reset.dto.InitiatePasswordResetRequestDto;
import com.mytelmed.core.reset.dto.ResetPasswordRequestDto;
import com.mytelmed.core.reset.entity.ResetToken;
import com.mytelmed.core.reset.repository.ResetTokenRepository;
import com.mytelmed.infrastructure.email.service.EmailService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;


@Slf4j
@Service
public class PasswordResetService {
    private final String resetBaseUrl;
    private final long tokenExpirationMinutes;
    private final ResetTokenRepository resetTokenRepository;
    private final EmailService emailService;
    private final PatientService patientService;
    private final AccountService accountService;

    public PasswordResetService(
            EmailService emailService,
            ResetTokenRepository resetTokenRepository,
            @Value("${application.security.password-reset.base-url}") String resetBaseUrl,
            @Value("${application.security.password-reset.expiration-minutes}") long tokenExpirationMinutes,
            PatientService patientService, AccountService accountService) {
        this.emailService = emailService;
        this.resetTokenRepository = resetTokenRepository;
        this.resetBaseUrl = resetBaseUrl;
        this.tokenExpirationMinutes = tokenExpirationMinutes;
        this.patientService = patientService;
        this.accountService = accountService;
    }

    private ResetToken createPasswordResetToken(Account account) {
        resetTokenRepository.deleteByAccount(account);
        ResetToken token = ResetToken.builder()
                .account(account)
                .expiredAt(Instant.now().plus(tokenExpirationMinutes, ChronoUnit.MINUTES))
                .build();
        return resetTokenRepository.save(token);
    }

    private Optional<Account> validatePasswordResetToken(String token) {
        return resetTokenRepository.findByToken(token)
                .filter(resetToken -> resetToken.getExpiredAt().isAfter(Instant.now()))
                .map(ResetToken::getAccount);
    }

    @Transactional
    public void initiatePasswordReset(InitiatePasswordResetRequestDto request) throws AppException {
        log.debug("Initiating password reset with email: {}", request.email());

        try {
            Patient patient = patientService.findPatientByEmail(request.email());

            if (!patient.getNric().equals(request.nric())) {
                throw new InvalidCredentialsException("Email or NRIC does does not match system records");
            }

            Account account = patient.getAccount();
            ResetToken token = createPasswordResetToken(account);
            String resetUrl = resetBaseUrl + "/" + token.getToken();
            emailService.sendPasswordResetEmail(request.email(), patient.getName(), resetUrl, tokenExpirationMinutes);

            log.info("Password reset initiated for user: {}", account.getId());
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error sending password reset email: {}", e.getMessage(), e);
            throw new AppException("Failed to initiate password reset");
        }
    }

    @Transactional
    public void resetPassword(String token, ResetPasswordRequestDto request) {
        log.debug("Resetting password for token: {}", token);

        try {
            Account account = validatePasswordResetToken(token)
                    .orElseThrow(() -> new InvalidCredentialsException("Invalid or expired password reset link"));
            accountService.resetPasswordByAccountId(account.getId(), request.password());

            log.info("Password successfully reset for user: {}", account.getId());
        } catch (InvalidCredentialsException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error resetting password: {}", e.getMessage(), e);
            throw new AppException("Failed to reset password");
        }
    }
}