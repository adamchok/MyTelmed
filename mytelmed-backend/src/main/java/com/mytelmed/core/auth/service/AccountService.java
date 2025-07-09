package com.mytelmed.core.auth.service;

import com.mytelmed.common.advice.exception.InvalidInputException;
import com.mytelmed.common.advice.exception.ResourceNotFoundException;
import com.mytelmed.common.advice.exception.UsernameAlreadyExistException;
import com.mytelmed.common.constant.AccountType;
import com.mytelmed.common.factory.account.AccountFactoryProducer;
import com.mytelmed.core.auth.dto.UpdateAccountPasswordRequestDto;
import com.mytelmed.core.auth.dto.UpdateAccountUsernameRequestDto;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.auth.repository.AccountRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;


@Slf4j
@Service
public class AccountService {
    private final PasswordEncoder passwordEncoder;
    private final AccountRepository accountRepository;
    private final AccountFactoryProducer factoryProducer;

    public AccountService(AccountRepository accountRepository,
                          PasswordEncoder passwordEncoder,
                          AccountFactoryProducer factoryProducer
    ) {
        this.accountRepository = accountRepository;
        this.passwordEncoder = passwordEncoder;
        this.factoryProducer = factoryProducer;
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
    public Account getAccountByUsername(String username) throws ResourceNotFoundException {
        log.debug("Fetching account with username: {}", username);

        return accountRepository.findByUsername(username)
                .orElseThrow(() -> {
                    log.warn("Account not found with username: {}", username);
                    return new ResourceNotFoundException("Account not found");
                });
    }

    @Transactional
    public void updateUsername(Account account, UpdateAccountUsernameRequestDto request) {
        log.debug("Updating username for account with ID: {}", account.getId());

        validatePassword(request.currentPassword(), account.getPassword());

        if (accountRepository.existsAccountByUsername(request.newUsername())) {
            throw new UsernameAlreadyExistException("Username already exists");
        }

        try {
            accountRepository.updateUsernameById(account.getId(), request.newUsername());
            log.info("Username update successful for account with ID: {}", account.getId());
        } catch (Exception e) {
            log.error("Unexpected error while updating username for account with ID: {}", account, e);
            throw e;
        }
    }

    @Transactional
    public void updatePassword(Account account, UpdateAccountPasswordRequestDto request) {
        log.debug("Updating password for account with ID: {}", account.getId());

        validatePassword(request.currentPassword(), account.getPassword());

        try {
            accountRepository.updatePasswordById(account.getId(), request.newPassword());
            log.info("Password update successful for account with ID: {}", account.getId());
        } catch (Exception e) {
            log.error("Unexpected error while updating password for account with ID: {}", account.getId(), e);
            throw e;
        }
    }

    @Transactional
    public void changePasswordById(UUID id, String password) {
        log.debug("Resetting password for account with ID: {}", id);

        try {
            accountRepository.updatePasswordById(id, passwordEncoder.encode(password));
            log.info("Password reset successful for account with ID: {}", id);
        } catch (Exception e) {
            log.error("Unexpected error while resetting password for account with ID: {}", id, e);
            throw e;
        }
    }

    @Transactional
    public Account createDoctorAccount(String email, String name) throws UsernameAlreadyExistException {
        log.debug("Creating doctor account with email: {}", email);

        try {
            if (accountRepository.findByUsername(email).isPresent()) {
                log.warn("Doctor account already exists with name: {}", email);
                throw new UsernameAlreadyExistException("Doctor account already exists with provided email");
            }

            Account account = factoryProducer.getFactory(AccountType.DOCTOR).createAccount(email, name);
            account = accountRepository.save(account);

            log.info("Created doctor account with name: {}", email);
            return account;
        } catch (UsernameAlreadyExistException e) {
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error while creating doctor account: {}", email, e);
            throw e;
        }
    }

    @Transactional
    public Account createPharmacistAccount(String email, String name) throws UsernameAlreadyExistException {
        log.debug("Creating pharmacist account with email: {}", email);

        try {
            if (accountRepository.findByUsername(email).isPresent()) {
                log.warn("Pharmacist account already exists with name: {}", email);
                throw new UsernameAlreadyExistException("Pharmacist account already exists with provided email");
            }

            Account account = factoryProducer.getFactory(AccountType.PHARMACIST).createAccount(email, name);
            account = accountRepository.save(account);

            log.info("Created pharmacist account with name: {}", email);
            return account;
        } catch (UsernameAlreadyExistException e) {
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error while creating pharmacist account: {}", email, e);
            throw e;
        }
    }

    @Transactional
    public Account createAdminAccount(String email, String name) throws UsernameAlreadyExistException {
        log.debug("Creating admin account with name: {}", email);

        try {
            if (accountRepository.findByUsername(email).isPresent()) {
                log.warn("Admin's account already exists with name: {}", email);
                throw new UsernameAlreadyExistException("Admin's account already exists with provided email");
            }

            Account account = factoryProducer.getFactory(AccountType.ADMIN).createAccount(email, name);

            account = accountRepository.save(account);
            log.info("Created admin account with name: {}", email);

            return account;
        } catch (UsernameAlreadyExistException e) {
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error while creating admin account: {}", email, e);
            throw e;
        }
    }

    @Transactional
    public Account createPatientAccount(String nric, String password) throws UsernameAlreadyExistException {
        log.debug("Creating patient account with NRIC: {}", nric);

        try {
            if (accountRepository.findByUsername(nric).isPresent()) {
                log.warn("Patient's account already exists with name: {}", nric);
                throw new UsernameAlreadyExistException("Account already exists with provided NRIC");
            }

            Account account = factoryProducer.getFactory(AccountType.PATIENT).createAccount(nric, password);
            account = accountRepository.save(account);

            log.info("Created patient account with name: {}", nric);

            return account;
        } catch (UsernameAlreadyExistException e) {
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error while creating patient account: {}", nric, e);
            throw e;
        }
    }

    private void validatePassword(String password, String currentPassword) throws InvalidInputException {
        if (!passwordEncoder.matches(password, currentPassword)) {
            log.warn("Password does not match with current password: {}", password);
            throw new InvalidInputException("Password does not match with current password");
        }
    }
}
