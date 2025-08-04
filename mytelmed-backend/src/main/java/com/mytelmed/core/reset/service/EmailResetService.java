package com.mytelmed.core.reset.service;

import com.mytelmed.common.advice.AppException;
import com.mytelmed.common.advice.exception.ResourceNotFoundException;
import com.mytelmed.common.constant.AccountType;
import com.mytelmed.common.event.reset.model.EmailResetEvent;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.auth.service.AccountService;
import com.mytelmed.core.reset.dto.InitiateEmailResetRequestDto;
import com.mytelmed.core.reset.dto.ResetEmailRequestDto;
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


@Service
@Slf4j
public class EmailResetService {
    private final String frontendUrl;
    private final long tokenExpirationMinutes;
    private final ResetTokenRepository resetTokenRepository;
    private final UserEmailResetService userEmailResetService;
    private final AccountService accountService;
    private final ApplicationEventPublisher applicationEventPublisher;

    public EmailResetService(
            UserEmailResetService userEmailResetService,
            ResetTokenRepository resetTokenRepository,
            AccountService accountService,
            @Value("${application.frontend.url}") String frontendUrl,
            @Value("${security.email.reset.expiration}") long tokenExpirationMinutes,
            ApplicationEventPublisher applicationEventPublisher) {
        this.userEmailResetService = userEmailResetService;
        this.resetTokenRepository = resetTokenRepository;
        this.accountService = accountService;
        this.frontendUrl = frontendUrl;
        this.tokenExpirationMinutes = tokenExpirationMinutes;
        this.applicationEventPublisher = applicationEventPublisher;
    }

    @Transactional
    protected ResetToken createEmailResetToken(Account account) {
        log.debug("Creating email reset token for account: {}", account.getId());

        // Find existing token by account
        Optional<ResetToken> existingToken = resetTokenRepository.findByAccount(account);

        if (existingToken.isPresent()) {
            log.debug("Found existing email reset token for account: {}", account.getId());

            // Renew password reset token if existing token is found
            log.debug("Renewing email reset token for account: {}", account.getId());
            String newToken = UUID.randomUUID().toString();
            ResetToken token = existingToken.get();
            token.setToken(newToken);
            token.setExpiredAt(Instant.now().plus(tokenExpirationMinutes, ChronoUnit.MINUTES));

            token = resetTokenRepository.save(token);

            log.debug("Renewed email reset token for account: {}, token: {}", account.getId(), token.getToken());
            return token;
        } else {
            log.debug("No existing email reset token found for account: {}, creating a new reset token",
                    account.getId());

            // Create a new email reset token for new requests
            ResetToken token = ResetToken.builder()
                    .account(account)
                    .expiredAt(Instant.now().plus(tokenExpirationMinutes, ChronoUnit.MINUTES))
                    .build();

            token = resetTokenRepository.save(token);

            log.debug("Created new email reset token for account: {}, token: {}", account.getId(), token.getToken());
            return token;
        }
    }

    @Transactional(readOnly = true)
    protected Optional<Account> validateEmailResetToken(String token) {
        return resetTokenRepository.findByToken(token)
                .filter(resetToken -> resetToken.getExpiredAt().isAfter(Instant.now()))
                .map(ResetToken::getAccount);
    }

    @Transactional
    public void initiateEmailReset(InitiateEmailResetRequestDto request) throws AppException {
        log.debug("Initiating email reset for user type: {}", request.userType());

        try {
            // Validate user credentials and get account
            Account account = userEmailResetService.validateUserForEmailReset(
                    request.nric(),
                    request.phone(),
                    request.serialNumber(),
                    request.name(),
                    request.userType()
            );

            // Create reset token
            ResetToken token = createEmailResetToken(account);

            // Get name for email
            String name = request.name();

            EmailResetEvent event = EmailResetEvent.builder()
                    .email(request.email())
                    .name(name)
                    .resetToken(token.getToken())
                    .build();

            log.debug("Sending email reset for user: {}, reset token: {}", account.getId(), token.getToken());
            applicationEventPublisher.publishEvent(event);

            log.info("Email reset initiated for user: {}", account.getId());
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error initiating email reset: {}", e.getMessage(), e);
            throw new AppException("Failed to initiate email reset");
        }
    }

    @Transactional
    public void resetEmail(String token, ResetEmailRequestDto request) throws AppException {
        log.debug("Resetting email for token: {}", token);

        try {
            Account account = validateEmailResetToken(token)
                    .orElseThrow(() -> {
                        log.error("Invalid or expired email reset link");
                        return new ResourceNotFoundException("Token not found");
                    });

            // Determine user type from account permissions
            String userType = account.getPermission().getAccess();

            // Reset email using the appropriate service
            userEmailResetService.resetEmailByAccountId(account.getId(), request.email(), AccountType.valueOf(userType));

            // Delete token
            resetTokenRepository.deleteByAccount(account);

            log.info("Successful email reset for account: {}", account.getId());
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error resetting email: {}", e.getMessage(), e);
            throw new AppException("Failed to reset email");
        }
    }
}
