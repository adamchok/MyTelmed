package com.mytelmed.core.reset.service;

import com.mytelmed.common.advice.exception.InvalidCredentialsException;
import com.mytelmed.common.advice.exception.ResourceNotFoundException;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.auth.service.AccountService;
import com.mytelmed.core.patient.entity.Patient;
import com.mytelmed.core.patient.service.PatientService;
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
    public boolean initiatePasswordReset(String email, String nric) {
        try {
            Patient patient = patientService.getPatientByEmail(email);

            if (!patient.getNric().equals(nric)) {
                throw new InvalidCredentialsException("The NRIC does not match system records");
            }

            Account account = patient.getAccount();
            ResetToken token = createPasswordResetToken(account);
            String resetUrl = resetBaseUrl + "/" + token.getToken();
            emailService.sendPasswordResetEmail(email, patient.getName(), resetUrl);
            log.info("Password reset initiated for user: {}", account.getId());
            return true;
        } catch (Exception e) {
            log.error("Error sending password reset email: {}", e.getMessage(), e);
            return false;
        }
    }

    @Transactional
    public boolean resetPassword(String token, String newPassword) {
        try {
            Account account = validatePasswordResetToken(token)
                    .orElseThrow(() -> new InvalidCredentialsException("Invalid or expired password reset link"));

            if (accountService.resetPasswordById(account.getId(), newPassword)) {
                resetTokenRepository.deleteByAccount(account);
                log.info("Password successfully reset for user: {}", account.getId());
                return true;
            } else {
                throw new ResourceNotFoundException("Account not found");
            }
        } catch (Exception e) {
            log.error("Error resetting password: {}", e.getMessage(), e);
        }
        return false;
    }
}