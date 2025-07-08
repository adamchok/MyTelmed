package com.mytelmed.core.admin.service;

import com.mytelmed.common.advice.AppException;
import com.mytelmed.common.advice.exception.ResourceNotFoundException;
import com.mytelmed.common.advice.exception.UsernameAlreadyExistException;
import com.mytelmed.common.utils.PasswordGenerator;
import com.mytelmed.core.admin.dto.CreateAdminRequestDto;
import com.mytelmed.core.admin.dto.UpdateAdminRequestDto;
import com.mytelmed.core.admin.entity.Admin;
import com.mytelmed.core.admin.repository.AdminRepository;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.auth.service.AccountService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

@Slf4j
@Service
public class AdminService {
    private final AdminRepository adminRepository;
    private final AccountService accountService;

    public AdminService(AdminRepository adminRepository, AccountService accountService) {
        this.adminRepository = adminRepository;
        this.accountService = accountService;
    }

    @Transactional(readOnly = true)
    public boolean isAdminExistsByUsername(String username) {
        return adminRepository.existsAdminByAccountUsername(username);
    }

    @Transactional(readOnly = true)
    public Page<Admin> findAll(int page, int pageSize) {
        log.debug("Finding all admins with page: {} and pageSize: {}", page, pageSize);

        Pageable pageable = PageRequest.of(page, pageSize);
        Page<Admin> admins = adminRepository.findAll(pageable);

        log.info("Found {} admins", admins.getTotalElements());
        return admins;
    }

    @Transactional(readOnly = true)
    public Admin findById(UUID adminId) throws ResourceNotFoundException {
        log.debug("Finding admin by ID: {}", adminId);

        Admin admin = adminRepository.findById(adminId)
                .orElseThrow(() -> {
                    log.warn("Admin not found with ID: {}", adminId);
                    return new ResourceNotFoundException("Admin not found");
                });

        log.info("Found admin with ID: {}", adminId);
        return admin;
    }

    @Transactional(readOnly = true)
    public Admin findByAccount(Account account) throws ResourceNotFoundException {
        log.debug("Finding admin by account ID: {}", account.getId());

        Admin admin = adminRepository.findByAccount(account)
                .orElseThrow(() -> {
                    log.warn("Admin not found with account ID: {}", account.getId());
                    return new ResourceNotFoundException("Admin not found");
                });

        log.info("Found admin with account ID: {}", account.getId());
        return admin;
    }

    @Transactional
    public void create(CreateAdminRequestDto request) throws UsernameAlreadyExistException {
        log.debug("Creating admin account: {}", request.email());

        // Create an admin account
        Account account = accountService.createAdminAccount(request.email(), request.name());

        try {
            // Create an admin
            Admin admin = Admin.builder()
                    .account(account)
                    .nric(request.nric())
                    .name(request.name())
                    .email(request.email())
                    .phone(request.phone())
                    .build();

            // Save the admin
            adminRepository.save(admin);

            log.info("Created admin account: {}", request.email());
        } catch (Exception e) {
            log.error("Unexpected error while creating admin account: {}", request.email(), e);
            throw new AppException("Failed to create admin account");
        }
    }

    @Transactional
    public void updateByAccount(Account account, UpdateAdminRequestDto request) throws AppException {
        log.debug("Updating admin profile for account: {}", account.getId());

        // Find admin by account
        Admin admin = findByAccount(account);

        try {
            // Update admin profile
            admin.setName(request.name());
            admin.setEmail(request.email());
            admin.setPhone(request.phone());

            adminRepository.save(admin);

            log.info("Updated admin profile for account: {}", account.getId());
        } catch (Exception e) {
            log.error("Error updating admin profile: {}", e.getMessage(), e);
            throw new AppException("Failed to update admin profile");
        }
    }

    @Transactional
    public void deleteById(UUID id) throws AppException {
        log.debug("Deleting admin with ID: {}", id);

        try {
            // Delete admin
            adminRepository.deleteById(id);

            log.info("Deleted admin with ID: {}", id);
        } catch (Exception e) {
            log.error("Error deleting admin: {}", e.getMessage(), e);
            throw new AppException("Failed to delete admin");
        }
    }

    @Transactional
    public void activateById(UUID id) throws AppException {
        log.debug("Activating admin with ID: {}", id);

        // Find admin by ID
        Admin admin = findById(id);

        try {
            // Activate admin account
            admin.getAccount().setEnabled(true);

            // Save admin
            adminRepository.save(admin);

            log.info("Activated admin with ID: {}", id);
        } catch (Exception e) {
            log.error("Error activating admin: {}", e.getMessage(), e);
            throw new AppException("Failed to activate admin");
        }
    }

    @Transactional
    public void deactivateById(UUID id) throws AppException {
        log.debug("Deactivating admin with ID: {}", id);

        // Find admin by ID
        Admin admin = findById(id);

        try {
            // Disable admin account
            admin.getAccount().setEnabled(false);

            // Save admin
            adminRepository.save(admin);

            log.info("Deactivated admin with ID: {}", id);
        } catch (Exception e) {
            log.error("Error deactivating admin: {}", e.getMessage(), e);
            throw new AppException("Failed to deactivate admin");
        }
    }

    @Transactional
    public void resetAccountPassword(UUID id) throws AppException {
        log.debug("Resetting password for admin with ID: {}", id);

        // Find admin by ID
        Admin admin = findById(id);

        try {
            // Generate a new random password
            String newPassword = PasswordGenerator.generateRandomPassword();

            // Reset account password
            accountService.changePasswordById(admin.getAccount().getId(), newPassword);

            log.info("Reset password for admin with ID: {}", id);
        } catch (Exception e) {
            log.error("Error resetting admin password: {}", e.getMessage(), e);
            throw new AppException("Failed to reset admin password");
        }
    }
}
