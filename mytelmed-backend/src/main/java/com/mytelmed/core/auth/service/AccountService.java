package com.mytelmed.core.auth.service;

import com.mytelmed.common.advice.exception.ResourceNotFoundException;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.auth.repository.AccountRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Optional;
import java.util.UUID;


@Slf4j
@Service
public class AccountService {
    private final PasswordEncoder passwordEncoder;
    private final AccountRepository accountRepository;

    public AccountService(AccountRepository accountRepository, PasswordEncoder passwordEncoder) {
        this.accountRepository = accountRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Account getAccountById(UUID id) {
        return accountRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Account not found with ID: {}", id);
                    return new ResourceNotFoundException("Account not found");
                });
    }

    public Optional<Account> getAccountByUsername(String username) {
        return accountRepository.findByUsername(username);
    }

    public boolean resetPasswordById(UUID id, String password) {
        int rowsAffected = accountRepository.updatePasswordById(id, passwordEncoder.encode(password));

        if (rowsAffected == 1) {
            log.info("Password reset for account with ID: {}", id);
            return true;
        } else {
            log.warn("Password reset failed for account with ID: {}", id);
            return false;
        }
    }
}
