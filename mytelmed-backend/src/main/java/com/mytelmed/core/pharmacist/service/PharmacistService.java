package com.mytelmed.core.pharmacist.service;

import com.mytelmed.common.advice.AppException;
import com.mytelmed.common.advice.exception.InvalidInputException;
import com.mytelmed.common.advice.exception.ResourceNotFoundException;
import com.mytelmed.common.advice.exception.UsernameAlreadyExistException;
import com.mytelmed.common.constant.file.ImageType;
import com.mytelmed.common.event.account.model.AccountActivatedEvent;
import com.mytelmed.common.event.account.model.AccountDeactivatedEvent;
import com.mytelmed.common.event.account.model.AccountPasswordResetEvent;
import com.mytelmed.common.event.image.ImageDeletedEvent;
import com.mytelmed.common.utils.DateTimeUtil;
import com.mytelmed.common.utils.HashUtil;
import com.mytelmed.common.utils.PasswordGenerator;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.auth.service.AccountService;
import com.mytelmed.core.facility.entity.Facility;
import com.mytelmed.core.facility.service.FacilityService;
import com.mytelmed.core.image.entity.Image;
import com.mytelmed.core.image.service.ImageService;
import com.mytelmed.core.pharmacist.dto.CreatePharmacistRequestDto;
import com.mytelmed.core.pharmacist.dto.UpdatePharmacistFacilityRequestDto;
import com.mytelmed.core.pharmacist.dto.UpdatePharmacistProfileRequestDto;
import com.mytelmed.core.pharmacist.dto.UpdatePharmacistRequestDto;
import com.mytelmed.core.pharmacist.entity.Pharmacist;
import com.mytelmed.core.pharmacist.repository.PharmacistRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.services.s3.model.S3Exception;
import java.time.LocalDate;
import java.util.UUID;


@Slf4j
@Service
public class PharmacistService {
    private final PharmacistRepository pharmacistRepository;
    private final FacilityService facilityService;
    private final ImageService imageService;
    private final AccountService accountService;
    private final ApplicationEventPublisher eventPublisher;

    public PharmacistService(PharmacistRepository pharmacistRepository,
                             FacilityService facilityService,
                             ImageService imageService, AccountService accountService,
                             ApplicationEventPublisher eventPublisher) {
        this.pharmacistRepository = pharmacistRepository;
        this.facilityService = facilityService;
        this.imageService = imageService;
        this.accountService = accountService;
        this.eventPublisher = eventPublisher;
    }

    @Transactional(readOnly = true)
    public Page<Pharmacist> findAll(int page, int pageSize) {
        log.debug("Finding all pharmacists with page: {} and pageSize: {}", page, pageSize);

        try {
            Pageable pageable = PageRequest.of(page, pageSize);
            return pharmacistRepository.findAll(pageable);
        } catch (Exception e) {
            log.error("Failed to fetch all paginated pharmacists with page {} and page size {}", page, pageSize, e);
            throw new AppException("Failed to fetch all paginated pharmacists");
        }
    }

    @Transactional(readOnly = true)
    public Pharmacist findById(UUID pharmacistId) throws ResourceNotFoundException {
        log.debug("Finding pharmacist by ID: {}", pharmacistId);

        Pharmacist pharmacist = pharmacistRepository.findById(pharmacistId)
                .orElseThrow(() -> {
                    log.warn("Pharmacist not found with ID: {}", pharmacistId);
                    return new ResourceNotFoundException("Pharmacist not found");
                });

        log.info("Found pharmacist with ID: {}", pharmacistId);
        return pharmacist;
    }

    @Transactional(readOnly = true)
    public Pharmacist findByAccount(Account account) throws ResourceNotFoundException {
        log.debug("Finding pharmacist by account ID: {}", account.getId());

        Pharmacist pharmacist = pharmacistRepository.findByAccount(account)
                .orElseThrow(() -> {
                    log.warn("Pharmacist not found with account ID: {}", account.getId());
                    return new ResourceNotFoundException("Pharmacist not found");
                });

        log.info("Found pharmacist with account ID: {}", account.getId());
        return pharmacist;
    }

    @Transactional(readOnly = true)
    public Pharmacist findByNric(String nric) throws ResourceNotFoundException {
        log.debug("Finding pharmacist with NRIC: {}", nric);

        Pharmacist pharmacist = pharmacistRepository.findByHashedNric(HashUtil.sha256(nric))
                .orElseThrow(() -> {
                    log.warn("Pharmacist not found with NRIC: {}", nric);
                    return new ResourceNotFoundException("Pharmacist not found");
                });

        log.info("Found pharmacist with NRIC: {}", nric);
        return pharmacist;
    }

    @Transactional(readOnly = true)
    public Pharmacist findByEmail(String email) throws ResourceNotFoundException {
        log.debug("Finding pharmacist with email: {}", email);

        Pharmacist pharmacist = pharmacistRepository.findByHashedEmail(HashUtil.sha256(email))
                .orElseThrow(() -> {
                    log.warn("Pharmacist not found with email: {}", email);
                    return new ResourceNotFoundException("Pharmacist not found");
                });

        log.info("Found pharmacist with email: {}", email);
        return pharmacist;
    }

    @Transactional(readOnly = true)
    public Pharmacist findByAccountId(UUID accountId) throws ResourceNotFoundException {
        log.debug("Finding pharmacist with account ID: {}", accountId);

        Pharmacist pharmacist = pharmacistRepository.findByAccountId(accountId)
                .orElseThrow(() -> {
                    log.warn("Pharmacist not found with account ID: {}", accountId);
                    return new ResourceNotFoundException("Pharmacist not found");
                });

        log.info("Found pharmacist with account ID: {}", accountId);
        return pharmacist;
    }

    @Transactional
    public void resetEmailByAccountId(UUID accountId, String newEmail) {
        log.debug("Resetting pharmacist email for account ID: {}", accountId);

        try {
            Pharmacist pharmacist = findByAccount(accountService.getAccountById(accountId));
            pharmacist.setEmail(newEmail);
            pharmacistRepository.save(pharmacist);

            log.info("Reset pharmacist email for account ID: {}", accountId);
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error while resetting pharmacist email: {}", accountId, e);
            throw e;
        }
    }

    @Transactional
    public void create(CreatePharmacistRequestDto request) throws AppException {
        log.debug("Creating pharmacist account: {}", request.email());

        // Create a pharmacist account
        Account account = accountService.createPharmacistAccount(request.email(), request.name());

        // Find facility by ID
        Facility facility = facilityService.findFacilityById(request.facilityId());

        // Parse local date of birth
        LocalDate dateOfBirth = parseDateOfBirth(request.dateOfBirth());


        // Validate with existing pharmacists
        if (pharmacistRepository.existsPharmacistByHashedEmail(HashUtil.sha256(request.email()))) {
            throw new InvalidInputException("Pharmacist with this email already exists");
        } else if (pharmacistRepository.existsPharmacistByHashedNric(HashUtil.sha256(request.nric()))) {
            throw new InvalidInputException("Pharmacist with this NRIC already exists");
        } else if (pharmacistRepository.existsPharmacistByHashedPhone(HashUtil.sha256(request.phone()))) {
            throw new InvalidInputException("Pharmacist with this phone number already exists");
        }

        try {
            // Create a pharmacist
            Pharmacist pharmacist = Pharmacist.builder()
                    .name(request.name())
                    .account(account)
                    .nric(request.nric())
                    .email(request.email())
                    .phone(request.phone())
                    .dateOfBirth(dateOfBirth)
                    .gender(request.gender())
                    .facility(facility)
                    .build();

            // Save the pharmacist
            pharmacist = pharmacistRepository.save(pharmacist);

            log.info("Created pharmacist account: {}", request.email());
        } catch (Exception e) {
            log.error("Unexpected error while creating pharmacist account: {}", request.email(), e);
            throw new AppException("Failed to create pharmacist account");
        }
    }

    @Transactional
    public void update(UUID pharmacistId, UpdatePharmacistRequestDto request) throws UsernameAlreadyExistException {
        log.debug("Updating pharmacist account: {}", request.email());

        // Find pharmacist
        Pharmacist pharmacist = findById(pharmacistId);

        // Find facility by ID
        Facility facility = facilityService.findFacilityById(request.facilityId());

        // Verify date of birth
        LocalDate dateOfBirth = parseDateOfBirth(request.dateOfBirth());

        // Validate existing pharmacist details
        if (!pharmacist.getHashedEmail().equals(HashUtil.sha256(request.email())) &&
                pharmacistRepository.existsPharmacistByHashedEmail(HashUtil.sha256(request.email()))) {
            throw new InvalidInputException("Pharmacist with this email already exists");
        } else if (!pharmacist.getHashedNric().equals(HashUtil.sha256(request.nric())) &&
                pharmacistRepository.existsPharmacistByHashedNric(HashUtil.sha256(request.nric()))) {
            throw new InvalidInputException("Pharmacist with this NRIC already exists");
        } else if (!pharmacist.getHashedPhone().equals(HashUtil.sha256(request.phone())) &&
                pharmacistRepository.existsPharmacistByHashedPhone(HashUtil.sha256(request.phone()))) {
            throw new InvalidInputException("Pharmacist with this phone number already exists");
        }

        try {
            // Update pharmacist
            pharmacist.setName(request.name());
            pharmacist.setEmail(request.email());
            pharmacist.setNric(request.nric());
            pharmacist.setPhone(request.phone());
            pharmacist.setDateOfBirth(dateOfBirth);
            pharmacist.setGender(request.gender());
            pharmacist.setFacility(facility);

            // Save the pharmacist
            pharmacist = pharmacistRepository.save(pharmacist);

            log.info("Updated pharmacist with ID: {}", pharmacistId);
        } catch (Exception e) {
            log.error("Unexpected error while creating pharmacist account: {}", request.email(), e);
            throw new AppException("Failed to create pharmacist account");
        }
    }

    @Transactional
    public void updateByAccount(Account account, UpdatePharmacistProfileRequestDto request) throws AppException {
        log.debug("Updating pharmacist profile for account: {}", account.getId());

        // Find pharmacist by account
        Pharmacist pharmacist = findByAccount(account);

        // Validate existing pharmacist details
        if (!pharmacist.getHashedEmail().equals(HashUtil.sha256(request.email())) &&
                pharmacistRepository.existsPharmacistByHashedEmail(HashUtil.sha256(request.email()))) {
            throw new InvalidInputException("This email is already in use");
        } else if (!pharmacist.getHashedPhone().equals(HashUtil.sha256(request.phone())) &&
                pharmacistRepository.existsPharmacistByHashedPhone(HashUtil.sha256(request.phone()))) {
            throw new InvalidInputException("This phone number already in use");
        }

        try {
            // Update pharmacist profile
            LocalDate dateOfBirth = parseDateOfBirth(request.dateOfBirth());
            pharmacist.setName(request.name());
            pharmacist.setEmail(request.email());
            pharmacist.setPhone(request.phone());
            pharmacist.setDateOfBirth(dateOfBirth);
            pharmacist.setGender(request.gender());

            // Save pharmacist
            pharmacistRepository.save(pharmacist);

            log.info("Updated pharmacist profile for account: {}", account.getId());
        } catch (Exception e) {
            log.error("Error updating pharmacist profile: {}", e.getMessage(), e);
            throw new AppException("Failed to update pharmacist profile");
        }
    }

    @Transactional
    public void updateProfileImageByAccount(Account account, MultipartFile profileImage) throws AppException {
        log.debug("Updating pharmacist profile image for account: {}", account.getId());

        if (profileImage == null || profileImage.isEmpty()) {
            throw new InvalidInputException("Profile image is required");
        }

        // Find pharmacist by account
        Pharmacist pharmacist = findByAccount(account);

        try {
            // Process profile image
            processProfileImage(pharmacist, profileImage);

            log.info("Updated pharmacist profile image for account: {}", account.getId());
        } catch (Exception e) {
            log.error("Error updating pharmacist profile image: {}", e.getMessage(), e);
            throw new AppException("Failed to update pharmacist profile image");
        }
    }

    @Transactional
    public void uploadProfileImageById(UUID pharmacistId, MultipartFile profileImage) throws AppException {
        log.debug("Uploading image for pharmacist with ID: {}", pharmacistId);

        if (profileImage == null || profileImage.isEmpty()) {
            throw new InvalidInputException("Profile image is required");
        }

        // Find pharmacist by ID
        Pharmacist pharmacist = findById(pharmacistId);

        try {
            // Process profile image
            processProfileImage(pharmacist, profileImage);

            log.info("Uploaded image for pharmacist with ID: {}", pharmacistId);
        } catch (Exception e) {
            log.error("Error uploading image for pharmacist: {}", e.getMessage(), e);
            throw new AppException("Failed to upload pharmacist image");
        }
    }

    @Transactional
    public void updateFacilityById(UUID id, UpdatePharmacistFacilityRequestDto request) throws AppException {
        log.debug("Updating pharmacist facility with ID: {}", id);

        // Find pharmacist by ID
        Pharmacist pharmacist = findById(id);

        // Find facility by facility ID
        Facility facility = facilityService.findFacilityById(request.facilityId());

        try {
            // Update pharmacist facility
            pharmacist.setFacility(facility);

            // Save pharmacist
            pharmacistRepository.save(pharmacist);

            log.info("Updated pharmacist facility with ID: {}", id);
        } catch (Exception e) {
            log.error("Error updating pharmacist facility: {}", e.getMessage(), e);
            throw new AppException("Failed to update pharmacist facility");
        }
    }

    @Transactional
    public void deleteById(UUID id) throws AppException {
        log.debug("Deleting pharmacist with ID: {}", id);

        // Find pharmacist by ID
        Pharmacist pharmacist = findById(id);

        try {
            // Get profile image for cleanup
            Image profileImage = pharmacist.getProfileImage();

            // Delete pharmacist
            pharmacistRepository.deleteById(id);

            // Clean up profile image if exists
            if (profileImage != null) {
                eventPublisher
                        .publishEvent(new ImageDeletedEvent(profileImage.getEntityId(), profileImage.getImageKey()));
            }

            log.info("Deleted pharmacist with ID: {}", id);
        } catch (Exception e) {
            log.error("Error deleting pharmacist: {}", e.getMessage(), e);
            throw new AppException("Failed to delete pharmacist");
        }
    }

    @Transactional
    public void activateById(UUID id) throws AppException {
        log.debug("Activating pharmacist with ID: {}", id);

        // Find pharmacist by ID
        Pharmacist pharmacist = findById(id);

        try {
            // Activate pharmacist account
            pharmacist.getAccount().setEnabled(true);

            // Save pharmacist
            pharmacistRepository.save(pharmacist);

            AccountActivatedEvent event = AccountActivatedEvent.builder()
                    .email(pharmacist.getEmail())
                    .username(pharmacist.getAccount().getUsername())
                    .role(pharmacist.getAccount().getPermission().getAccess())
                    .name(pharmacist.getName())
                    .build();

            eventPublisher.publishEvent(event);

            log.info("Activated pharmacist with ID: {}", id);
        } catch (Exception e) {
            log.error("Error activating pharmacist: {}", e.getMessage(), e);
            throw new AppException("Failed to activate pharmacist");
        }
    }

    @Transactional
    public void deactivateById(UUID id) throws AppException {
        log.debug("Deactivating pharmacist with ID: {}", id);

        // Find pharmacist by ID
        Pharmacist pharmacist = findById(id);

        try {
            // Disable pharmacist account
            pharmacist.getAccount().setEnabled(false);

            // Save pharmacist
            pharmacistRepository.save(pharmacist);

            AccountDeactivatedEvent event = AccountDeactivatedEvent.builder()
                    .email(pharmacist.getEmail())
                    .username(pharmacist.getAccount().getUsername())
                    .role(pharmacist.getAccount().getPermission().getAccess())
                    .name(pharmacist.getName())
                    .build();

            eventPublisher.publishEvent(event);

            log.info("Deactivated pharmacist with ID: {}", id);
        } catch (Exception e) {
            log.error("Error deactivating pharmacist: {}", e.getMessage(), e);
            throw new AppException("Failed to deactivate pharmacist");
        }
    }

    @Transactional
    public void resetAccountPassword(UUID id) throws AppException {
        log.debug("Resetting password for pharmacist with ID: {}", id);

        // Find pharmacist by ID
        Pharmacist pharmacist = findById(id);

        try {
            // Generate a new random password
            String newPassword = PasswordGenerator.generateRandomPassword();

            // Reset account password
            accountService.changePasswordById(pharmacist.getAccount().getId(), newPassword);

            AccountPasswordResetEvent event = AccountPasswordResetEvent.builder()
                    .email(pharmacist.getEmail())
                    .name(pharmacist.getName())
                    .username(pharmacist.getAccount().getUsername())
                    .role(pharmacist.getAccount().getPermission().getAccess())
                    .password(newPassword)
                    .build();

            eventPublisher.publishEvent(event);

            log.info("Reset password for pharmacist with ID: {}", id);
        } catch (Exception e) {
            log.error("Error resetting pharmacist password: {}", e.getMessage(), e);
            throw new AppException("Failed to reset pharmacist password");
        }
    }

    private LocalDate parseDateOfBirth(String dateOfBirthStr) throws InvalidInputException {
        return DateTimeUtil.stringToLocalDate(dateOfBirthStr)
                .orElseThrow(() -> {
                    log.warn("Invalid date of birth: {}", dateOfBirthStr);
                    return new InvalidInputException("Invalid date of birth");
                });
    }

    private void processProfileImage(Pharmacist pharmacist, MultipartFile profileImage)
            throws InvalidInputException, S3Exception {
        if (profileImage == null || profileImage.isEmpty()) {
            return;
        }

        // Save image to S3
        Image image = imageService.updateAndGetImage(ImageType.PROFILE, pharmacist.getId(), profileImage);

        // Update pharmacist profile image
        pharmacist.setProfileImage(image);

        // Save pharmacist
        pharmacistRepository.save(pharmacist);

        log.info("Uploaded profile image for pharmacist with ID: {}", pharmacist.getId());
    }
}
