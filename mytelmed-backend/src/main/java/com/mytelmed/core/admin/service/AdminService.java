package com.mytelmed.core.admin.service;

import com.mytelmed.common.advice.exception.UsernameAlreadyExistException;
import com.mytelmed.core.admin.entity.Admin;
import com.mytelmed.core.admin.repository.AdminRepository;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.auth.service.AccountService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;


@Slf4j
@Service
public class AdminService {
    private final AdminRepository adminRepository;
    private final AccountService accountService;

    public AdminService(AdminRepository adminRepository, AccountService accountService) {
        this.adminRepository = adminRepository;
        this.accountService = accountService;
    }

    public boolean isAdminExistsByUsername(String username) {
        return adminRepository.existsAdminByAccountUsername(username);
    }

    @Transactional
    public Optional<Admin> createAdmin(String username, String password, String name, String email, String phone) throws UsernameAlreadyExistException {
        log.debug("Creating default admin account: {}", username);

        try {
            Optional<Account> defaultAccount = accountService.createAdminAccount(username, password);

            if (defaultAccount.isPresent()) {
                Admin admin = Admin.builder()
                        .account(defaultAccount.get())
                        .email(email)
                        .name(name)
                        .phone(phone)
                        .build();

                admin = adminRepository.save(admin);
                log.info("Created default admin account: {}", username);

                return Optional.of(admin);
            } else {
                log.warn("Failed to create default admin account: {}", username);
            }
        } catch (UsernameAlreadyExistException e) {
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error while creating default admin account: {}}", username, e);
        }
        return Optional.empty();
    }
}
