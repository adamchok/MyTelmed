package com.mytelmed.core.auth.service;

import com.mytelmed.common.advice.exception.ResourceNotFoundException;
import com.mytelmed.common.advice.exception.UsernameAlreadyExistException;
import com.mytelmed.common.constants.AccountType;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.auth.entity.Permission;
import com.mytelmed.core.auth.repository.AccountRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.Optional;
import java.util.UUID;


@Slf4j
@Service
public class AccountService {
    private final SecureRandom random = new SecureRandom();
    private final PasswordEncoder passwordEncoder;
    private final AccountRepository accountRepository;

    public AccountService(AccountRepository accountRepository, PasswordEncoder passwordEncoder) {
        this.accountRepository = accountRepository;
        this.passwordEncoder = passwordEncoder;
    }

    private String generateRandomEncodedPassword() {
        SecureRandom random = new SecureRandom();
        byte[] passwordBytes = new byte[12];
        random.nextBytes(passwordBytes);
        String rawPassword = Base64.getUrlEncoder().withoutPadding().encodeToString(passwordBytes);
        return passwordEncoder.encode(rawPassword);
    }

    @Transactional(readOnly = true)
    public Account getAccountById(UUID id) throws ResourceNotFoundException {
        return accountRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Account not found with ID: {}", id);
                    return new ResourceNotFoundException("Account not found");
                });
    }

    @Transactional(readOnly = true)
    public Optional<Account> getAccountByUsername(String username) {
        return accountRepository.findByUsername(username);
    }

    @Transactional
    public boolean resetPasswordById(UUID id, String password) {
        int rowsAffected = accountRepository.updatePasswordById(id, passwordEncoder.encode(password));

        if (rowsAffected == 1) {
            log.info("Password reset successful for account with ID: {}", id);
            return true;
        } else {
            log.warn("Password reset failed for account with ID: {}", id);
            return false;
        }
    }

    @Transactional
    public Optional<Account> createDoctorAccount(String email) throws UsernameAlreadyExistException {
        log.debug("Creating doctor account with email: {}", email);

        try {
            if (accountRepository.findByUsername(email).isPresent()) {
                log.warn("Doctor's account already exists with username: {}", email);
                throw new UsernameAlreadyExistException("Doctor's account already exists with provided email");
            }

            String encodedPassword = generateRandomEncodedPassword();

            Permission permission = Permission.builder()
                    .type(AccountType.DOCTOR)
                    .build();

            Account account = Account.builder()
                    .username(email)
                    .password(encodedPassword)
                    .permission(permission)
                    .build();

            account = accountRepository.save(account);
            log.info("Created doctor account with username: {}", email);

            return Optional.of(account);
        } catch (UsernameAlreadyExistException e) {
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error while creating doctor account: {}", email, e);
            return Optional.empty();
        }
    }

    @Transactional
    public Optional<Account> createAdminAccount(String username, String password) throws UsernameAlreadyExistException {
        log.debug("Creating admin account with username: {}", username);

        try {
            if (accountRepository.findByUsername(username).isPresent()) {
                log.warn("Admin's account already exists with username: {}", username);
                throw new UsernameAlreadyExistException("Admin's account already exists with provided email");
            }

            String encodedPassword = passwordEncoder.encode(password);

            Permission permission = Permission.builder()
                    .type(AccountType.ADMIN)
                    .build();

            Account account = Account.builder()
                    .username(username)
                    .password(encodedPassword)
                    .permission(permission)
                    .build();

            account = accountRepository.save(account);
            log.info("Created admin account with username: {}", username);

            return Optional.of(account);
        } catch (UsernameAlreadyExistException e) {
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error while creating admin account: {}", username, e);
            return Optional.empty();
        }
    }
}
