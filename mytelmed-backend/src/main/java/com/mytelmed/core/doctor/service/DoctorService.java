package com.mytelmed.core.doctor.service;

import com.mytelmed.common.advice.AppException;
import com.mytelmed.common.advice.exception.InvalidInputException;
import com.mytelmed.common.advice.exception.ResourceNotFoundException;
import com.mytelmed.common.constant.file.ImageType;
import com.mytelmed.common.event.image.ImageDeletedEvent;
import com.mytelmed.common.utils.DateTimeUtil;
import com.mytelmed.common.utils.PasswordGenerator;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.auth.service.AccountService;
import com.mytelmed.core.doctor.dto.CreateDoctorRequestDto;
import com.mytelmed.core.doctor.dto.UpdateDoctorProfileRequestDto;
import com.mytelmed.core.doctor.dto.UpdateDoctorSpecialtiesAndFacilityRequestDto;
import com.mytelmed.core.doctor.entity.Doctor;
import com.mytelmed.core.doctor.repository.DoctorRepository;
import com.mytelmed.core.facility.entity.Facility;
import com.mytelmed.core.facility.service.FacilityService;
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
import java.time.LocalDate;
import java.util.UUID;


@Slf4j
@Service
public class DoctorService {
    private final DoctorRepository doctorRepository;
    private final FacilityService facilityService;
    private final ImageService imageService;
    private final AccountService accountService;
    private final ApplicationEventPublisher eventPublisher;

    public DoctorService(DoctorRepository doctorRepository,
                         FacilityService facilityService,
                         ImageService imageService, AccountService accountService,
                         ApplicationEventPublisher eventPublisher) {
        this.doctorRepository = doctorRepository;
        this.facilityService = facilityService;
        this.imageService = imageService;
        this.accountService = accountService;
        this.eventPublisher = eventPublisher;
    }

    @Transactional(readOnly = true)
    public Page<Doctor> findAll(int page, int pageSize) {
        log.debug("Finding all doctors with page: {} and pageSize: {}", page, pageSize);

        try {
            Pageable pageable = PageRequest.of(page, pageSize);
            return doctorRepository.findAll(pageable);
        } catch (Exception e) {
            log.error("Failed to fetch all paginated doctors with page {} and page size {}", page, pageSize, e);
            throw new AppException("Failed to fetch all paginated doctors");
        }
    }

    @Transactional(readOnly = true)
    public Page<Doctor> findAllByFacilityId(UUID facilityId, int page, int pageSize) {
        log.debug("Finding all doctors by facilityId {} with page: {} and pageSize: {}", facilityId, page,
                pageSize);

        try {
            Pageable pageable = PageRequest.of(page, pageSize);
            return doctorRepository.findAllByFacilityId(facilityId, pageable);
        } catch (Exception e) {
            log.error("Failed to fetch all doctors by facility {} with page {} and page size {}", facilityId, page,
                    pageSize, e);
            throw new AppException("Failed to fetch all paginated doctors by facility");
        }
    }

    @Transactional(readOnly = true)
    public Page<Doctor> findAllBySpeciality(String speciality, int page, int pageSize) {
        log.debug("Finding all doctors by speciality {} with page: {} and pageSize: {}", speciality, page,
                pageSize);

        try {
            Pageable pageable = PageRequest.of(page, pageSize);
            return doctorRepository.findDistinctBySpecialityListContainingIgnoreCase(speciality, pageable);
        } catch (Exception e) {
            log.error("Failed to fetch all doctors by speciality {} with page {} and page size {}", speciality, page,
                    pageSize, e);
            throw new AppException("Failed to fetch all paginated doctors by speciality");
        }
    }

    @Transactional(readOnly = true)
    public Doctor findById(UUID doctorId) throws ResourceNotFoundException {
        log.debug("Finding doctor by ID: {}", doctorId);

        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> {
                    log.warn("Doctor not found with ID: {}", doctorId);
                    return new ResourceNotFoundException("Doctor not found");
                });

        log.info("Found doctor with ID: {}", doctorId);
        return doctor;
    }

    @Transactional(readOnly = true)
    public Doctor findByAccount(Account account) throws ResourceNotFoundException {
        log.debug("Finding doctor by account ID: {}", account.getId());

        Doctor doctor = doctorRepository.findByAccount(account)
                .orElseThrow(() -> {
                    log.warn("Doctor not found with account ID: {}", account.getId());
                    return new ResourceNotFoundException("Doctor not found");
                });

        log.info("Found doctor with account ID: {}", account.getId());
        return doctor;
    }

    @Transactional
    public Doctor create(CreateDoctorRequestDto request) throws AppException {
        log.debug("Creating doctor account: {}", request.email());

        // Find facility by ID
        Facility facility = facilityService.findFacilityById(request.facilityId());

        // Create a doctor account
        Account account = accountService.createDoctorAccount(request.email(), request.name());

        try {
            LocalDate dateOfBirth = parseDateOfBirth(request.dateOfBirth());

            // Create a doctor
            Doctor doctor = Doctor.builder()
                    .name(request.name())
                    .account(account)
                    .nric(request.nric())
                    .email(request.email())
                    .phone(request.phone())
                    .dateOfBirth(dateOfBirth)
                    .gender(request.gender())
                    .facility(facility)
                    .specialityList(request.specialityList())
                    .languageList(request.languageList())
                    .qualifications(request.qualifications())
                    .build();

            // Save the doctor
            doctor = doctorRepository.save(doctor);

            log.info("Created doctor account: {}", request.email());

            return doctor;
        } catch (Exception e) {
            log.error("Unexpected error while creating doctor account: {}", request.email(), e);
            throw new AppException("Failed to create doctor account");
        }
    }

    @Transactional
    public void updateByAccount(Account account, UpdateDoctorProfileRequestDto request) throws AppException {
        log.debug("Updating doctor profile for account: {}", account.getId());

        // Find doctor by account
        Doctor doctor = findByAccount(account);

        try {
            // Update doctor profile
            LocalDate dateOfBirth = parseDateOfBirth(request.dateOfBirth());
            doctor.setName(request.name());
            doctor.setEmail(request.email());
            doctor.setPhone(request.phone());
            doctor.setDateOfBirth(dateOfBirth);
            doctor.setGender(request.gender());
            doctor.setLanguageList(request.languageList());
            doctor.setQualifications(request.qualifications());

            // Save doctor
            doctorRepository.save(doctor);

            log.info("Updated doctor profile for account: {}", account.getId());
        } catch (Exception e) {
            log.error("Error updating doctor profile: {}", e.getMessage(), e);
            throw new AppException("Failed to update doctor profile");
        }
    }

    @Transactional
    public void updateProfileImageByAccount(Account account, MultipartFile profileImage) throws AppException {
        log.debug("Updating doctor profile image for account: {}", account.getId());

        if (profileImage == null || profileImage.isEmpty()) {
            throw new InvalidInputException("Profile image is required");
        }

        // Find doctor by account
        Doctor doctor = findByAccount(account);

        try {
            // Process profile image
            processProfileImage(doctor, profileImage);

            log.info("Updated doctor profile image for account: {}", account.getId());
        } catch (Exception e) {
            log.error("Error updating doctor profile image: {}", e.getMessage(), e);
            throw new AppException("Failed to update doctor profile image");
        }
    }

    @Transactional
    public void uploadProfileImageById(UUID doctorId, MultipartFile profileImage) throws AppException {
        log.debug("Uploading image for doctor with ID: {}", doctorId);

        if (profileImage == null || profileImage.isEmpty()) {
            throw new InvalidInputException("Profile image is required");
        }

        // Find doctor by ID
        Doctor doctor = findById(doctorId);

        try {
            // Process profile image
            processProfileImage(doctor, profileImage);

            log.info("Uploaded image for doctor with ID: {}", doctorId);
        } catch (Exception e) {
            log.error("Error uploading image for doctor: {}", e.getMessage(), e);
            throw new AppException("Failed to upload doctor image");
        }
    }

    @Transactional
    public void updateSpecialitiesAndFacilityById(UUID doctorId, UpdateDoctorSpecialtiesAndFacilityRequestDto request)
            throws AppException {
        log.debug("Updating doctor specialities and facility with ID: {}", doctorId);

        // Find doctor by ID
        Doctor doctor = findById(doctorId);

        // Find facility by facility ID
        Facility facility = facilityService.findFacilityById(request.facilityId());

        try {
            // Update doctor specialities and facility
            doctor.setFacility(facility);
            doctor.setSpecialityList(request.specialityList());

            // Save doctor
            doctorRepository.save(doctor);

            log.info("Updated doctor specialities and facility with ID: {}", doctorId);
        } catch (Exception e) {
            log.error("Error updating doctor specialities and facility: {}", e.getMessage(), e);
            throw new AppException("Failed to update doctor specialities and facility");
        }
    }

    @Transactional
    public void deleteById(UUID id) throws AppException {
        log.debug("Deleting doctor with ID: {}", id);

        // Find doctor by ID
        Doctor doctor = findById(id);

        try {
            // Get profile image for cleanup
            Image profileImage = doctor.getProfileImage();

            // Delete doctor
            doctorRepository.deleteById(id);

            // Clean up profile image if exists
            if (profileImage != null) {
                eventPublisher
                        .publishEvent(new ImageDeletedEvent(profileImage.getEntityId(), profileImage.getImageKey()));
            }

            log.info("Deleted doctor with ID: {}", id);
        } catch (Exception e) {
            log.error("Error deleting doctor: {}", e.getMessage(), e);
            throw new AppException("Failed to delete doctor");
        }
    }

    @Transactional
    public void activateById(UUID id) throws AppException {
        log.debug("Activating doctor with ID: {}", id);

        // Find doctor by ID
        Doctor doctor = findById(id);

        try {
            // Activate doctor account
            doctor.getAccount().setEnabled(true);

            // Save doctor
            doctorRepository.save(doctor);

            log.info("Activated doctor with ID: {}", id);
        } catch (Exception e) {
            log.error("Error activating doctor: {}", e.getMessage(), e);
            throw new AppException("Failed to activate doctor");
        }
    }

    @Transactional
    public void deactivateById(UUID id) throws AppException {
        log.debug("Deactivating doctor with ID: {}", id);

        // Find doctor by ID
        Doctor doctor = findById(id);

        try {
            // Disable doctor account
            doctor.getAccount().setEnabled(false);

            // Save doctor
            doctorRepository.save(doctor);

            log.info("Deactivated doctor with ID: {}", id);
        } catch (Exception e) {
            log.error("Error deactivating doctor: {}", e.getMessage(), e);
            throw new AppException("Failed to deactivate doctor");
        }
    }

    @Transactional
    public void resetAccountPassword(UUID id) throws AppException {
        log.debug("Resetting password for doctor with ID: {}", id);

        // Find doctor by ID
        Doctor doctor = findById(id);

        try {
            // Generate a new random password
            String newPassword = PasswordGenerator.generateRandomPassword();

            // Reset account password
            accountService.changePasswordById(doctor.getAccount().getId(), newPassword);

            log.info("Reset password for doctor with ID: {}", id);
        } catch (Exception e) {
            log.error("Error resetting doctor password: {}", e.getMessage(), e);
            throw new AppException("Failed to reset doctor password");
        }
    }

    private LocalDate parseDateOfBirth(String dateOfBirthStr) throws InvalidInputException {
        return DateTimeUtil.stringToLocalDate(dateOfBirthStr)
                .orElseThrow(() -> {
                    log.warn("Invalid date of birth: {}", dateOfBirthStr);
                    return new InvalidInputException("Invalid date of birth");
                });
    }

    private void processProfileImage(Doctor doctor, MultipartFile profileImage)
            throws InvalidInputException, S3Exception {
        if (profileImage == null || profileImage.isEmpty()) {
            return;
        }

        // Update / Save image to S3
        Image image = imageService.updateAndGetImage(ImageType.PROFILE, doctor.getId(), profileImage);

        // Update doctor profile image
        doctor.setProfileImage(image);

        // Save doctor
        doctorRepository.save(doctor);

        log.info("Uploaded profile image for doctor with ID: {}", doctor.getId());
    }
}
