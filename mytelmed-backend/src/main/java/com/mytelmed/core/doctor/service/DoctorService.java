package com.mytelmed.core.doctor.service;

import com.mytelmed.common.advice.AppException;
import com.mytelmed.common.advice.exception.InvalidInputException;
import com.mytelmed.common.advice.exception.ResourceNotFoundException;
import com.mytelmed.common.constants.ImageType;
import com.mytelmed.common.utils.DateTimeUtil;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.auth.service.AccountService;
import com.mytelmed.core.doctor.dto.CreateDoctorRequestDto;
import com.mytelmed.core.doctor.dto.UpdateDoctorProfileRequestDto;
import com.mytelmed.core.doctor.dto.UpdateDoctorSpecialitiesAndFacilityRequestDto;
import com.mytelmed.core.doctor.entity.Doctor;
import com.mytelmed.core.doctor.repository.DoctorRepository;
import com.mytelmed.core.facility.entity.Facility;
import com.mytelmed.core.facility.service.FacilityService;
import com.mytelmed.core.image.entity.Image;
import com.mytelmed.core.image.service.ImageService;
import com.mytelmed.core.speciality.entity.Speciality;
import com.mytelmed.core.speciality.service.SpecialityService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.services.s3.model.S3Exception;
import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;


@Slf4j
@Service
public class DoctorService {
    private final DoctorRepository doctorRepository;
    private final FacilityService facilityService;
    private final SpecialityService specialityService;
    private final ImageService imageService;
    private final AccountService accountService;

    public DoctorService(DoctorRepository doctorRepository,
                         FacilityService facilityService,
                         SpecialityService specialityService,
                         ImageService imageService, AccountService accountService) {
        this.doctorRepository = doctorRepository;
        this.facilityService = facilityService;
        this.specialityService = specialityService;
        this.imageService = imageService;
        this.accountService = accountService;
    }

    private List<Speciality> getValidatedSpecialities(List<UUID> specialityIds) throws ResourceNotFoundException {
        List<Speciality> specialities = specialityService.findAllSpecialitiesByIdList(specialityIds);
        if (specialities.isEmpty()) {
            log.warn("Specialities not found: {}", specialityIds.toString());
            throw new ResourceNotFoundException("Specialities not found");
        }
        return specialities;
    }

    private LocalDate parseDateOfBirth(String dateOfBirthStr) throws InvalidInputException {
        return DateTimeUtil.stringToLocalDate(dateOfBirthStr)
                .orElseThrow(() -> {
                    log.warn("Invalid date of birth: {}", dateOfBirthStr);
                    return new InvalidInputException("Invalid date of birth");
                });
    }

    private Account createDoctorAccount(String email) throws AppException {
        return accountService.createDoctorAccount(email)
                .orElseThrow(() -> {
                    log.warn("Failed to create doctor account for doctor with email: {}", email);
                    return new AppException("Failed to create doctor account");
                });
    }

    private Doctor buildDoctor(CreateDoctorRequestDto request, Facility facility,
                               List<Speciality> specialities, LocalDate dateOfBirth, Account account) {
        return Doctor.builder()
                .name(request.name())
                .account(account)
                .nric(request.nric())
                .email(request.email())
                .serialNumber(request.serialNumber())
                .phone(request.phone())
                .dateOfBirth(dateOfBirth)
                .gender(request.gender())
                .facility(facility)
                .specialityList(specialities)
                .languageList(request.languageList())
                .qualifications(request.qualifications())
                .build();
    }

    private void processProfileImage(MultipartFile profileImage, Doctor doctor) throws InvalidInputException, IOException, S3Exception {
        if (profileImage == null || profileImage.isEmpty()) {
            return;
        }

        Image image = imageService.saveAndGetImage(ImageType.PROFILE, doctor.getId(), profileImage);
        doctor.setProfileImage(image);
        doctorRepository.save(doctor);
        log.info("Uploaded profile image for doctor with ID: {}", doctor.getId());

        if (doctor.getProfileImage() == null) {
            log.warn("Failed to upload profile image for doctor with ID: {}", doctor.getId());
        }
    }

    private void updateDoctorDetails(Doctor doctor, UpdateDoctorProfileRequestDto request, LocalDate dateOfBirth) {
        doctor.setName(request.name());
        doctor.setPhone(request.phone());
        doctor.setDateOfBirth(dateOfBirth);
        doctor.setGender(request.gender());
        doctor.setLanguageList(request.languageList());
        doctor.setQualifications(request.qualifications());
    }

    @Transactional(readOnly = true)
    public Doctor findDoctorById(UUID doctorId) throws ResourceNotFoundException {
        return doctorRepository.findById(doctorId)
                .orElseThrow(() -> {
                    log.warn("Doctor not found with ID: {}", doctorId);
                    return new ResourceNotFoundException("Doctor not found");
                });
    }

    @Transactional(readOnly = true)
    public Doctor findDoctorByAccountId(UUID accountId) throws ResourceNotFoundException {
        return doctorRepository.findByAccountId(accountId)
                .orElseThrow(() -> {
                    log.warn("Doctor not found with account ID: {}", accountId);
                    return new ResourceNotFoundException("Doctor not found");
                });
    }

    @Transactional(readOnly = true)
    public Page<Doctor> findAllPaginatedDoctors(int page, int pageSize) throws AppException {
        log.debug("Fetching all doctors by page {} and page size {}", page, pageSize);

        try {
            Pageable pageable = PageRequest.of(page, pageSize);
            return doctorRepository.findAll(pageable);
        } catch (Exception e) {
            log.error("Failed to fetch all paginated doctors with page {} and page size {}", page, pageSize, e);
            throw new AppException("Failed to fetch all paginated doctors");
        }
    }

    @Transactional(readOnly = true)
    public Page<Doctor> findAllPaginatedDoctorsBySpeciality(String speciality, int page, int pageSize) throws AppException {
        log.debug("Fetching all doctors by speciality {} and page {} and page size {}", speciality, page, pageSize);

        try {
            Pageable pageable = PageRequest.of(page, pageSize);
            return doctorRepository.findDistinctBySpecialityListNameContainingIgnoreCase(speciality, pageable);
        } catch (Exception e) {
            log.error("Failed to fetch all doctors by speciality {} with page {} and page size {}", speciality, page, pageSize, e);
            throw new AppException("Failed to fetch all paginated doctors by speciality");
        }
    }

    @Transactional(readOnly = true)
    public Page<Doctor> findAllPaginatedDoctorsByFacilityId(UUID facilityId, int page, int pageSize) throws AppException {
        log.debug("Fetching all doctors by facilityId {} and page {} and page size {}", facilityId, page, pageSize);

        try {
            Pageable pageable = PageRequest.of(page, pageSize);
            return doctorRepository.findAllByFacilityId(facilityId, pageable);
        } catch (Exception e) {
            log.error("Failed to fetch all doctors by facility {} with page {} and page size {}", facilityId, page, pageSize, e);
            throw new AppException("Failed to fetch all paginated doctors by facility");
        }
    }

    @Transactional
    public void createDoctor(CreateDoctorRequestDto request, MultipartFile profileImage) throws AppException {
        log.debug("Received request to create doctor with request: {}", request);

        try {
            Facility facility = facilityService.findFacilityById(request.facilityId());
            List<Speciality> specialities = getValidatedSpecialities(request.specialityIds());
            LocalDate dateOfBirth = parseDateOfBirth(request.dateOfBirth());
            Account account = createDoctorAccount(request.email());

            Doctor doctor = buildDoctor(request, facility, specialities, dateOfBirth, account);
            doctor = doctorRepository.save(doctor);

            processProfileImage(profileImage, doctor);

            log.info("Created doctor with ID: {}", doctor.getId());
        } catch (Exception e) {
            if (e instanceof AppException) {
                throw (AppException) e;
            }
            log.error("Unexpected error while creating doctor: {}", request, e);
            throw new AppException("Failed to create doctor");
        }
    }

    @Transactional
    public void updateDoctorProfileByAccountId(UUID accountId, UpdateDoctorProfileRequestDto request) throws AppException {
        log.debug("Received request to update doctor profile with request: {}", request);
        try {
            Doctor doctor = findDoctorByAccountId(accountId);
            LocalDate dateOfBirth = parseDateOfBirth(request.dateOfBirth());

            updateDoctorDetails(doctor, request, dateOfBirth);

            doctor = doctorRepository.save(doctor);
            log.info("Updated doctor with ID: {}", doctor.getId());
        } catch (Exception e) {
            if (e instanceof AppException) {
                throw (AppException) e;
            }
            log.error("Unexpected error while updating doctor: {}", request, e);
            throw new AppException("Failed to update doctor profile");
        }
    }

    @Transactional
    public void updateDoctorProfileImageByAccountId(UUID accountId, MultipartFile profileImage) throws AppException {
        log.debug("Received request to update doctor profile image with ID: {}", accountId);

        try {
            if (profileImage == null || profileImage.isEmpty()) {
                throw new InvalidInputException("Profile image is required");
            }

            Doctor doctor = findDoctorByAccountId(accountId);

            processProfileImage(profileImage, doctor);

            log.info("Updated doctor profile image with ID: {}", doctor.getId());
        } catch (Exception e) {
            if (e instanceof AppException) {
                throw (AppException) e;
            }
            log.error("Unexpected error while updating doctor profile image: {}", accountId, e);
            throw new AppException("Failed to update profile image");
        }
    }

    @Transactional
    public void updateDoctorSpecialitiesAndFacilityByDoctorId(UUID doctorId,
                                                              UpdateDoctorSpecialitiesAndFacilityRequestDto request) throws AppException {
        log.debug("Received request to update doctor specialities and facility with ID: {}", doctorId);

        try {
            Doctor doctor = findDoctorByAccountId(doctorId);
            Facility facility = facilityService.findFacilityById(request.facilityId());
            List<Speciality> specialityList = getValidatedSpecialities(request.specialityIds());

            doctor.setFacility(facility);
            doctor.setSpecialityList(specialityList);

            doctor = doctorRepository.save(doctor);

            log.info("Updated doctor specialities and facility with ID: {}", doctor.getId());
        } catch (Exception e) {
            if (e instanceof AppException) {
                throw (AppException) e;
            }
            log.error("Unexpected error while updating doctor: {}", request, e);
            throw new AppException("Failed to update doctor specialities and facility");
        }
    }

    @Transactional
    public void deleteDoctorByDoctorId(UUID doctorId) throws AppException {
        log.debug("Received request to delete doctor with ID: {}", doctorId);

        try {
            Doctor doctor = findDoctorById(doctorId);

            doctorRepository.delete(doctor);

            log.info("Deleted doctor with ID: {}", doctor.getId());
        } catch (Exception e) {
            if (e instanceof AppException) {
                throw (AppException) e;
            }
            log.error("Unexpected error while deleting doctor: {}", doctorId, e);
            throw new AppException("Failed to delete doctor");
        }
    }
}
