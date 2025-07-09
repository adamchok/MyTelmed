package com.mytelmed.core.pharmacist.service;

import com.mytelmed.common.advice.AppException;
import com.mytelmed.common.advice.exception.InvalidInputException;
import com.mytelmed.common.advice.exception.ResourceNotFoundException;
import com.mytelmed.common.advice.exception.UsernameAlreadyExistException;
import com.mytelmed.common.constant.file.ImageType;
import com.mytelmed.common.event.image.ImageDeletedEvent;
import com.mytelmed.common.utils.DateTimeUtil;
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
    public boolean isPharmacistExistsByUsername(String username) {
        return pharmacistRepository.existsPharmacistByAccountUsername(username);
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
    public Page<Pharmacist> findAllByFacilityId(UUID facilityId, int page, int pageSize) {
        log.debug("Finding all pharmacists by facilityId {} with page: {} and pageSize: {}", facilityId, page,
                pageSize);

        try {
            Pageable pageable = PageRequest.of(page, pageSize);
            return pharmacistRepository.findAllByFacilityId(facilityId, pageable);
        } catch (Exception e) {
            log.error("Failed to fetch all pharmacists by facility {} with page {} and page size {}", facilityId, page,
                    pageSize, e);
            throw new AppException("Failed to fetch all paginated pharmacists by facility");
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

    @Transactional
    public Pharmacist create(CreatePharmacistRequestDto request) throws UsernameAlreadyExistException {
        log.debug("Creating pharmacist account: {}", request.email());

        // Create a pharmacist account
        Account account = accountService.createPharmacistAccount(request.email(), request.name());

        // Find facility by ID
        Facility facility = facilityService.findFacilityById(request.facilityId());

        try {
            LocalDate dateOfBirth = parseDateOfBirth(request.dateOfBirth());

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

            return pharmacist;
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
