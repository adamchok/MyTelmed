package com.mytelmed.core.reset.service;

import com.mytelmed.common.advice.AppException;
import com.mytelmed.common.advice.exception.InvalidCredentialsException;
import com.mytelmed.common.constant.AccountType;
import com.mytelmed.common.event.reset.model.PasswordResetEvent;
import com.mytelmed.core.admin.entity.Admin;
import com.mytelmed.core.admin.service.AdminService;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.auth.service.AccountService;
import com.mytelmed.core.doctor.entity.Doctor;
import com.mytelmed.core.doctor.service.DoctorService;
import com.mytelmed.core.patient.entity.Patient;
import com.mytelmed.core.patient.service.PatientService;
import com.mytelmed.core.pharmacist.entity.Pharmacist;
import com.mytelmed.core.pharmacist.service.PharmacistService;
import com.mytelmed.core.reset.dto.InitiatePasswordResetRequestDto;
import com.mytelmed.core.reset.dto.ResetPasswordRequestDto;
import com.mytelmed.core.reset.entity.ResetToken;
import com.mytelmed.core.reset.repository.ResetTokenRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;


@Slf4j
@Service
public class PasswordResetService {
    private final long tokenExpirationMinutes;
    private final ResetTokenRepository resetTokenRepository;
    private final UserPasswordResetService userPasswordResetService;
    private final AccountService accountService;
    private final PatientService patientService;
    private final DoctorService doctorService;
    private final PharmacistService pharmacistService;
    private final AdminService adminService;
    private final ApplicationEventPublisher applicationEventPublisher;

    public PasswordResetService(
            ResetTokenRepository resetTokenRepository,
            @Value("${security.password.reset.expiration}") long tokenExpirationMinutes,
            UserPasswordResetService userPasswordResetService,
            AccountService accountService,
            PatientService patientService,
            DoctorService doctorService,
            PharmacistService pharmacistService,
            AdminService adminService,
            ApplicationEventPublisher applicationEventPublisher) {
        this.resetTokenRepository = resetTokenRepository;
        this.tokenExpirationMinutes = tokenExpirationMinutes;
        this.userPasswordResetService = userPasswordResetService;
        this.accountService = accountService;
        this.patientService = patientService;
        this.doctorService = doctorService;
        this.pharmacistService = pharmacistService;
        this.adminService = adminService;
        this.applicationEventPublisher = applicationEventPublisher;
    }

    @Transactional
    protected ResetToken renewOrCreateAndGetPasswordResetToken(Account account) {
        log.debug("Creating password reset token for account: {}", account.getId());

        // Find existing token by account
        Optional<ResetToken> existingToken = resetTokenRepository.findByAccount(account);

        if (existingToken.isPresent()) {
            log.debug("Found existing password reset token for account: {}", account.getId());

            // Renew password reset token if existing token is found
            log.debug("Renewing password reset token for account: {}", account.getId());
            String newToken = UUID.randomUUID().toString();
            ResetToken token = existingToken.get();
            token.setToken(newToken);
            token.setExpiredAt(Instant.now().plus(tokenExpirationMinutes, ChronoUnit.MINUTES));

            token = resetTokenRepository.save(token);

            log.debug("Renewed password reset token for account: {}, token: {}", account.getId(), token.getToken());
            return token;
        } else {
            log.debug("No existing password reset token found for account: {}, creating a new reset token",
                    account.getId());

            // Create a new password reset token for new requests
            ResetToken token = ResetToken.builder()
                    .account(account)
                    .expiredAt(Instant.now().plus(tokenExpirationMinutes, ChronoUnit.MINUTES))
                    .build();

            token = resetTokenRepository.save(token);

            log.debug("Created new password reset token for account: {}, token: {}", account.getId(), token.getToken());
            return token;
        }
    }

    @Transactional(readOnly = true)
    protected Optional<Account> validatePasswordResetToken(String token) {
        return resetTokenRepository.findByToken(token)
                .filter(resetToken -> resetToken.getExpiredAt().isAfter(Instant.now()))
                .map(ResetToken::getAccount);
    }

    @Transactional
    public void initiatePasswordReset(InitiatePasswordResetRequestDto request) throws AppException {
        log.debug("Initiating password reset for user type: {}", request.userType());

        try {
            // Validate user credentials and get account
            Account account = userPasswordResetService.validateUserForPasswordReset(
                    request.email(),
                    request.nric(),
                    request.userType()
            );

            // Create reset token
            ResetToken token = renewOrCreateAndGetPasswordResetToken(account);

            // Get user name for email
            String userName = getUserName(account, request.userType());

            PasswordResetEvent event = PasswordResetEvent.builder()
                    .email(request.email())
                    .name(userName)
                    .expirationMinutes(tokenExpirationMinutes)
                    .resetToken(token.getToken())
                    .build();

            log.debug("Sending password reset for user: {}, reset token: {}", account.getId(), token.getToken());
            applicationEventPublisher.publishEvent(event);

            log.info("Password reset initiated for user: {}", account.getId());
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error initiating password reset: {}", e.getMessage(), e);
            throw new AppException("Failed to initiate password reset");
        }
    }

    @Transactional
    public void resetPassword(String token, ResetPasswordRequestDto request) {
        log.debug("Resetting password for token: {}", token);

        try {
            Account account = validatePasswordResetToken(token)
                    .orElseThrow(() -> {
                        log.error("Invalid or expired password reset link");
                        return new InvalidCredentialsException("Invalid or expired password reset link");
                    });
            accountService.changePasswordById(account.getId(), request.password());

            resetTokenRepository.deleteByAccount(account);
            log.info("Password successfully reset for user: {}", account.getId());
        } catch (InvalidCredentialsException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error resetting password: {}", e.getMessage(), e);
            throw new AppException("Failed to reset password");
        }
    }

    @Transactional(readOnly = true)
    protected String getUserName(Account account, AccountType userType) {
        UUID accountId = account.getId();

        return switch (userType) {
            case PATIENT -> {
                Patient patient = patientService.findPatientByAccountId(accountId);
                yield patient.getName();
            }
            case DOCTOR -> {
                Doctor doctor = doctorService.findByAccountId(accountId);
                yield doctor.getName();
            }
            case PHARMACIST -> {
                Pharmacist pharmacist = pharmacistService.findByAccountId(accountId);
                yield pharmacist.getName();
            }
            case ADMIN -> {
                Admin admin = adminService.findByAccountId(accountId);
                yield admin.getName();
            }
        };
    }
}
