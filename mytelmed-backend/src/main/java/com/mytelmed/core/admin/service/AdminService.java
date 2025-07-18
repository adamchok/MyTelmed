package com.mytelmed.core.admin.service;

import com.mytelmed.common.advice.AppException;
import com.mytelmed.common.advice.exception.InvalidInputException;
import com.mytelmed.common.advice.exception.ResourceNotFoundException;
import com.mytelmed.common.advice.exception.UsernameAlreadyExistException;
import com.mytelmed.common.constant.file.ImageType;
import com.mytelmed.common.event.account.model.AccountActivatedEvent;
import com.mytelmed.common.event.account.model.AccountDeactivatedEvent;
import com.mytelmed.common.event.account.model.AccountDeletionEvent;
import com.mytelmed.common.event.account.model.AccountPasswordResetEvent;
import com.mytelmed.common.utils.HashUtil;
import com.mytelmed.common.utils.PasswordGenerator;
import com.mytelmed.core.admin.dto.CreateAdminRequestDto;
import com.mytelmed.core.admin.dto.UpdateAdminProfileRequestDto;
import com.mytelmed.core.admin.dto.UpdateAdminRequestDto;
import com.mytelmed.core.admin.entity.Admin;
import com.mytelmed.core.admin.repository.AdminRepository;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.auth.service.AccountService;
import com.mytelmed.core.image.entity.Image;
import com.mytelmed.core.image.service.ImageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.services.s3.model.S3Exception;
import java.util.UUID;


@Slf4j
@Service
public class AdminService {
    private final AdminRepository adminRepository;
    private final AccountService accountService;
    private final ImageService imageService;
    private final ApplicationEventPublisher applicationEventPublisher;

    public AdminService(AdminRepository adminRepository, AccountService accountService, ImageService imageService,
                        ApplicationEventPublisher applicationEventPublisher) {
        this.adminRepository = adminRepository;
        this.accountService = accountService;
        this.imageService = imageService;
        this.applicationEventPublisher = applicationEventPublisher;
    }

    @Transactional(readOnly = true)
    public boolean isAdminExistsByHashNric(String nric) {
        return adminRepository.findByHashedNric(HashUtil.sha256(nric)).isPresent();
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

    @Transactional(readOnly = true)
    public Admin findByNric(String nric) throws ResourceNotFoundException {
        log.debug("Finding admin with NRIC: {}", nric);

        Admin admin = adminRepository.findByHashedNric(HashUtil.sha256(nric))
                .orElseThrow(() -> {
                    log.warn("Admin not found with NRIC: {}", nric);
                    return new ResourceNotFoundException("Admin not found");
                });

        log.info("Found admin with NRIC: {}", nric);
        return admin;
    }

    @Transactional(readOnly = true)
    public Admin findByEmail(String email) throws ResourceNotFoundException {
        log.debug("Finding admin with email: {}", email);

        Admin admin = adminRepository.findByHashedEmail(HashUtil.sha256(email))
                .orElseThrow(() -> {
                    log.warn("Admin not found with email: {}", email);
                    return new ResourceNotFoundException("Admin not found");
                });

        log.info("Found admin with email: {}", email);
        return admin;
    }

    @Transactional(readOnly = true)
    public Admin findByAccountId(UUID accountId) throws ResourceNotFoundException {
        log.debug("Finding admin with account ID: {}", accountId);

        Admin admin = adminRepository.findByAccountId(accountId)
                .orElseThrow(() -> {
                    log.warn("Admin not found with account ID: {}", accountId);
                    return new ResourceNotFoundException("Admin not found");
                });

        log.info("Found admin with account ID: {}", accountId);
        return admin;
    }

    @Transactional
    public void resetEmailByAccountId(UUID accountId, String newEmail) {
        log.debug("Resetting admin email for account ID: {}", accountId);

        try {
            Admin admin = findByAccount(accountService.getAccountById(accountId));
            admin.setEmail(newEmail);
            adminRepository.save(admin);

            log.info("Reset admin email for account ID: {}", accountId);
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error while resetting admin email: {}", accountId, e);
            throw e;
        }
    }

    @Transactional
    public void create(CreateAdminRequestDto request) throws UsernameAlreadyExistException, InvalidInputException {
        log.debug("Creating admin account: {}", request.email());

        if (adminRepository.existsAdminByHashedEmail(request.email())) {
            throw new InvalidInputException("Admin with this email already exists");
        } else if (adminRepository.existsAdminByHashedNric(request.nric())) {
            throw new InvalidInputException("Admin with this NRIC already exists");
        } else if (adminRepository.existsAdminByHashedPhone(HashUtil.sha256(request.phone()))) {
            throw new InvalidInputException("Admin with this phone number already exists");
        }

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
    public void update(UUID adminId, UpdateAdminRequestDto request) throws AppException {
        log.debug("Updating admin with ID: {}", adminId);

        // Find admin by ID
        Admin admin = findById(adminId);

        // Validate existing doctor details
        if (!admin.getHashedNric().equals(HashUtil.sha256(request.nric())) &&
                adminRepository.existsAdminByHashedNric(HashUtil.sha256(request.nric()))) {
            throw new InvalidInputException("Admin with this NRIC already exists");
        } else if (!admin.getHashedEmail().equals(HashUtil.sha256(request.email())) &&
                adminRepository.existsAdminByHashedEmail(HashUtil.sha256(request.email()))) {
            throw new InvalidInputException("Admin with this email already exists");
        } else if (!admin.getHashedPhone().equals(HashUtil.sha256(request.phone())) &&
                adminRepository.existsAdminByHashedPhone(HashUtil.sha256(request.phone()))) {
            throw new InvalidInputException("Admin with this phone number already exists");
        }

        try {
            // Update admin
            admin.setNric(request.nric());
            admin.setName(request.name());
            admin.setEmail(request.email());
            admin.setPhone(request.phone());

            // Save the admin
            adminRepository.save(admin);

            log.info("Updated admin with ID: {}", adminId);
        } catch (Exception e) {
            log.error("Unexpected error while updating admin account: {}", request.email(), e);
            throw new AppException("Failed to update admin account");
        }
    }

    @Transactional
    public void updateByAccount(Account account, UpdateAdminProfileRequestDto request) throws AppException {
        log.debug("Updating admin profile for account: {}", account.getId());

        // Find admin by account
        Admin admin = findByAccount(account);

        // Validate existing doctor details
        if (!admin.getHashedEmail().equals(HashUtil.sha256(request.email())) &&
                adminRepository.existsAdminByHashedEmail(HashUtil.sha256(request.email()))) {
            throw new InvalidInputException("This email is already in use");
        } else if (!admin.getHashedPhone().equals(HashUtil.sha256(request.phone())) &&
                adminRepository.existsAdminByHashedPhone(HashUtil.sha256(request.phone()))) {
            throw new InvalidInputException("This phone number is already in use");
        }

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
    public void updateProfileImageByAccount(Account account, MultipartFile profileImage) throws AppException {
        log.debug("Updating admin profile image for account: {}", account.getId());

        if (profileImage == null || profileImage.isEmpty()) {
            throw new InvalidInputException("Profile image is required");
        }

        // Find admin by account
        Admin admin = findByAccount(account);

        try {
            // Process profile image
            processProfileImage(admin, profileImage);

            log.info("Updated admin profile image for account: {}", account.getId());
        } catch (Exception e) {
            log.error("Error updating admin profile image: {}", e.getMessage(), e);
            throw new AppException("Failed to update admin profile image");
        }
    }

    @Transactional
    public void deleteById(UUID id) throws AppException {
        log.debug("Deleting admin with ID: {}", id);

        // Find admin
        Admin admin = findById(id);

        try {
            // Delete admin
            adminRepository.deleteById(id);

            // Notify admin about their account deletion
            AccountDeletionEvent event = AccountDeletionEvent.builder()
                    .email(admin.getEmail())
                    .name(admin.getName())
                    .build();

            applicationEventPublisher.publishEvent(event);

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

            AccountActivatedEvent event = AccountActivatedEvent.builder()
                    .email(admin.getEmail())
                    .name(admin.getName())
                    .build();

            applicationEventPublisher.publishEvent(event);

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

            AccountDeactivatedEvent event = AccountDeactivatedEvent.builder()
                    .email(admin.getEmail())
                    .name(admin.getName())
                    .build();

            applicationEventPublisher.publishEvent(event);

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

            // Notify admin about password reset
            AccountPasswordResetEvent event = AccountPasswordResetEvent.builder()
                    .email(admin.getEmail())
                    .name(admin.getName())
                    .password(newPassword)
                    .username(admin.getAccount().getUsername())
                    .build();

            applicationEventPublisher.publishEvent(event);

            log.info("Reset password for admin with ID: {}", id);
        } catch (Exception e) {
            log.error("Error resetting admin password: {}", e.getMessage(), e);
            throw new AppException("Failed to reset admin password");
        }
    }

    private void processProfileImage(Admin admin, MultipartFile profileImage) throws InvalidInputException, S3Exception {
        if (profileImage == null || profileImage.isEmpty()) {
            return;
        }

        // Save image to S3
        Image image = imageService.updateAndGetImage(ImageType.PROFILE, admin.getId(), profileImage);

        // Update admin profile image
        admin.setProfileImage(image);

        // Save admin
        adminRepository.save(admin);

        log.info("Uploaded profile image for admin with ID: {}", admin.getId());
    }
}
