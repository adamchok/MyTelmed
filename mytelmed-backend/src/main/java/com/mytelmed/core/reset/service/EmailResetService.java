package com.mytelmed.core.reset.service;

import com.mytelmed.common.advice.exception.InvalidCredentialsException;
import com.mytelmed.common.advice.exception.ResourceNotFoundException;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.patient.entity.Patient;
import com.mytelmed.core.patient.service.PatientService;
import com.mytelmed.core.reset.dto.InitiateEmailResetRequestDto;
import com.mytelmed.core.reset.dto.ResetEmailRequestDto;
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


@Service
@Slf4j
public class EmailResetService {
    private final String resetBaseUrl;
    private final long tokenExpirationMinutes;
    private final ResetTokenRepository resetTokenRepository;
    private final EmailService emailService;
    private final PatientService patientService;

    public EmailResetService(
            EmailService emailService,
            PatientService patientService,
            ResetTokenRepository resetTokenRepository,
            @Value("${application.security.email-reset.base-url}") String resetBaseUrl,
            @Value("${application.security.password-reset.expiration-minutes}") long tokenExpirationMinutes) {
        this.patientService = patientService;
        this.emailService = emailService;
        this.resetTokenRepository = resetTokenRepository;
        this.resetBaseUrl = resetBaseUrl;
        this.tokenExpirationMinutes = tokenExpirationMinutes;
    }

    private ResetToken createEmailResetToken(Account account) {
        resetTokenRepository.deleteByAccount(account);
        ResetToken token = ResetToken.builder()
                .account(account)
                .expiredAt(Instant.now().plus(tokenExpirationMinutes, ChronoUnit.MINUTES))
                .build();
        return resetTokenRepository.save(token);
    }

    private Optional<Account> validateEmailResetToken(String token) {
        return resetTokenRepository.findByToken(token)
                .filter(resetToken -> resetToken.getExpiredAt().isAfter(Instant.now()))
                .map(ResetToken::getAccount);
    }

    @Transactional
    public boolean initiateEmailReset(InitiateEmailResetRequestDto request) {
        try {
            Patient patient = patientService.getPatientByNric(request.nric());

            if (!patient.getName().equals(request.name())) {
                throw new InvalidCredentialsException("Full name does not match system records: " + request.name());
            } else if (!patient.getPhone().equals(request.phone())) {
                throw new InvalidCredentialsException("Phone does not match system records: " + request.phone());
            } else if (!patient.getSerialNumber().equals(request.serialNumber())) {
                throw new InvalidCredentialsException("Serial number does not match system records: " + request.serialNumber());
            }

            Account account = patient.getAccount();
            ResetToken token = createEmailResetToken(account);
            String resetUrl = resetBaseUrl + "/" + token.getToken();
            emailService.sendEmailResetEmail(request.email(), patient.getName(), resetUrl);
            log.info("Email reset initiated for user: {}", account.getId());
            return true;
        } catch (Exception e) {
            log.error("Error initiating email reset: {}", e.getMessage(), e);
            return false;
        }
    }

    @Transactional
    public boolean resetEmail(String token, ResetEmailRequestDto request) {
        try {
            Account account = validateEmailResetToken(token)
                    .orElseThrow(() -> new ResourceNotFoundException("Token not found"));

            Optional<Patient> patient = patientService.resetEmailByAccountId(account.getId(), request.email());

            if (patient.isEmpty()) {
                resetTokenRepository.deleteByAccount(account);
                log.info("Successful email reset for account: {}", account.getId());
                return true;
            }
        } catch (Exception e) {
            log.error("Error resetting email: {}", e.getMessage(), e);
        }
        return false;
    }
}
