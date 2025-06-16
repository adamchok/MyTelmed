package com.mytelmed.core.pharmacist.service;

import com.mytelmed.common.advice.AppException;
import com.mytelmed.common.advice.exception.InvalidInputException;
import com.mytelmed.common.advice.exception.ResourceNotFoundException;
import com.mytelmed.common.constants.file.ImageType;
import com.mytelmed.common.events.deletion.ImageDeletedEvent;
import com.mytelmed.common.utils.DateTimeUtil;
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
import java.io.IOException;
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

    private LocalDate parseDateOfBirth(String dateOfBirthStr) throws InvalidInputException {
        return DateTimeUtil.stringToLocalDate(dateOfBirthStr)
                .orElseThrow(() -> {
                    log.warn("Invalid date of birth: {}", dateOfBirthStr);
                    return new InvalidInputException("Invalid date of birth");
                });
    }

    private Pharmacist buildPharmacist(CreatePharmacistRequestDto request, Facility facility,
                                       LocalDate dateOfBirth, Account account) {
        return Pharmacist.builder()
                .name(request.name())
                .account(account)
                .nric(request.nric())
                .email(request.email())
                .serialNumber(request.serialNumber())
                .phone(request.phone())
                .dateOfBirth(dateOfBirth)
                .gender(request.gender())
                .facility(facility)
                .build();
    }

    private void processProfileImage(MultipartFile profileImage, Pharmacist pharmacist) throws InvalidInputException, IOException, S3Exception {
        if (profileImage == null || profileImage.isEmpty()) {
            return;
        }

        Image image = imageService.saveAndGetImage(ImageType.PROFILE, pharmacist.getId(), profileImage);
        pharmacist.setProfileImage(image);
        pharmacistRepository.save(pharmacist);
        log.info("Uploaded profile image for pharmacist with ID: {}", pharmacist.getId());

        if (pharmacist.getProfileImage() == null) {
            log.warn("Failed to upload profile image for pharmacist with ID: {}", pharmacist.getId());
        }
    }

    private void updatePharmacistDetails(Pharmacist pharmacist, UpdatePharmacistProfileRequestDto request, LocalDate dateOfBirth) {
        pharmacist.setName(request.name());
        pharmacist.setPhone(request.phone());
        pharmacist.setDateOfBirth(dateOfBirth);
        pharmacist.setGender(request.gender());
    }

    @Transactional(readOnly = true)
    public Pharmacist findPharmacistById(UUID pharmacistId) throws ResourceNotFoundException {
        return pharmacistRepository.findById(pharmacistId)
                .orElseThrow(() -> {
                    log.warn("Pharmacist not found with ID: {}", pharmacistId);
                    return new ResourceNotFoundException("Pharmacist not found");
                });
    }

    @Transactional(readOnly = true)
    public Pharmacist findPharmacistByAccountId(UUID accountId) throws ResourceNotFoundException {
        return pharmacistRepository.findByAccountId(accountId)
                .orElseThrow(() -> {
                    log.warn("Pharmacist not found with account ID: {}", accountId);
                    return new ResourceNotFoundException("Pharmacist not found");
                });
    }

    @Transactional(readOnly = true)
    public Page<Pharmacist> findAllPaginatedPharmacists(int page, int pageSize) throws AppException {
        log.debug("Fetching all pharmacist by page {} and page size {}", page, pageSize);

        try {
            Pageable pageable = PageRequest.of(page, pageSize);
            return pharmacistRepository.findAll(pageable);
        } catch (Exception e) {
            log.error("Failed to fetch all paginated pharmacists with page {} and page size {}", page, pageSize, e);
            throw new AppException("Failed to fetch all paginated pharmacists");
        }
    }

    @Transactional(readOnly = true)
    public Page<Pharmacist> findAllPaginatedPharmacistsByFacilityId(UUID facilityId, int page, int pageSize) throws AppException {
        log.debug("Fetching all pharmacists by facilityId {} and page {} and page size {}", facilityId, page, pageSize);

        try {
            Pageable pageable = PageRequest.of(page, pageSize);
            return pharmacistRepository.findAllByFacilityId(facilityId, pageable);
        } catch (Exception e) {
            log.error("Failed to fetch all pharmacists by facility {} with page {} and page size {}", facilityId, page, pageSize, e);
            throw new AppException("Failed to fetch all paginated pharmacists by facility");
        }
    }

    @Transactional
    public void createPharmacist(CreatePharmacistRequestDto request, MultipartFile profileImage) throws AppException {
        log.debug("Received request to create pharmacist with request: {}", request);

        try {
            Facility facility = facilityService.findFacilityById(request.facilityId());
            LocalDate dateOfBirth = parseDateOfBirth(request.dateOfBirth());
            Account account = accountService.createPharmacistAccount(request.email());

            Pharmacist pharmacist = buildPharmacist(request, facility, dateOfBirth, account);
            pharmacist = pharmacistRepository.save(pharmacist);

            processProfileImage(profileImage, pharmacist);

            log.info("Created pharmacist with ID: {}", pharmacist.getId());
        } catch (Exception e) {
            if (e instanceof AppException) {
                throw (AppException) e;
            }
            log.error("Unexpected error while creating pharmacist: {}", request, e);
            throw new AppException("Failed to create pharmacist");
        }
    }

    @Transactional
    public void updatePharmacistProfileByAccountId(UUID accountId, UpdatePharmacistProfileRequestDto request) throws AppException {
        log.debug("Received request to update pharmacist profile with request: {}", request);
        try {
            Pharmacist pharmacist = findPharmacistByAccountId(accountId);
            LocalDate dateOfBirth = parseDateOfBirth(request.dateOfBirth());

            updatePharmacistDetails(pharmacist, request, dateOfBirth);

            pharmacist = pharmacistRepository.save(pharmacist);
            log.info("Updated pharmacist with ID: {}", pharmacist.getId());
        } catch (Exception e) {
            if (e instanceof AppException) {
                throw (AppException) e;
            }
            log.error("Unexpected error while updating pharmacist: {}", request, e);
            throw new AppException("Failed to update pharmacist profile");
        }
    }

    @Transactional
    public void updatePharmacistProfileImageByAccountId(UUID accountId, MultipartFile profileImage) throws AppException {
        log.debug("Received request to update pharmacist profile image with ID: {}", accountId);

        try {
            if (profileImage == null || profileImage.isEmpty()) {
                throw new InvalidInputException("Profile image is required");
            }

            Pharmacist pharmacist = findPharmacistByAccountId(accountId);

            processProfileImage(profileImage, pharmacist);

            log.info("Updated pharmacist profile image with ID: {}", pharmacist.getId());
        } catch (Exception e) {
            if (e instanceof AppException) {
                throw (AppException) e;
            }
            log.error("Unexpected error while updating pharmacist profile image: {}", accountId, e);
            throw new AppException("Failed to update profile image");
        }
    }

    @Transactional
    public void updatePharmacistFacilityByPharmacistId(UUID pharmacistId,
                                                       UpdatePharmacistFacilityRequestDto request
    ) throws AppException {
        log.debug("Received request to update pharmacist facility with ID: {}", pharmacistId);

        try {
            Pharmacist pharmacist = findPharmacistByAccountId(pharmacistId);
            Facility facility = facilityService.findFacilityById(request.facilityId());

            pharmacist.setFacility(facility);

            pharmacist = pharmacistRepository.save(pharmacist);

            log.info("Updated pharmacist facility with ID: {}", pharmacist.getId());
        } catch (Exception e) {
            if (e instanceof AppException) {
                throw (AppException) e;
            }
            log.error("Unexpected error while updating pharmacist: {}", request, e);
            throw new AppException("Failed to update pharmacist specialities and facility");
        }
    }

    @Transactional
    public void deletePharmacistById(UUID pharmacistId) throws AppException {
        log.debug("Received request to delete pharmacist with ID: {}", pharmacistId);

        try {
            Pharmacist pharmacist = findPharmacistById(pharmacistId);
            Image profileImage = pharmacist.getProfileImage();

            pharmacistRepository.delete(pharmacist);

            if (profileImage != null) {
                eventPublisher.publishEvent(new ImageDeletedEvent(profileImage.getEntityId(), profileImage.getImageKey()));
            }

            log.info("Deleted pharmacist with ID: {}", pharmacist.getId());
        } catch (Exception e) {
            if (e instanceof AppException) {
                throw (AppException) e;
            }
            log.error("Unexpected error while deleting pharmacist: {}", pharmacistId, e);
            throw new AppException("Failed to delete pharmacist");
        }
    }
}
