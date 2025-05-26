package com.mytelmed.core.patient.service;

import com.mytelmed.common.advice.AppException;
import com.mytelmed.common.advice.exception.InvalidInputException;
import com.mytelmed.common.advice.exception.ResourceNotFoundException;
import com.mytelmed.common.constants.ImageType;
import com.mytelmed.common.utils.DateTimeUtil;
import com.mytelmed.common.utils.HashUtil;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.auth.service.AccountService;
import com.mytelmed.core.image.entity.Image;
import com.mytelmed.core.image.service.ImageService;
import com.mytelmed.core.patient.dto.CreatePatientRequestDto;
import com.mytelmed.core.patient.dto.UpdatePatientProfileRequestDto;
import com.mytelmed.core.patient.entity.Patient;
import com.mytelmed.core.patient.repository.PatientRepository;
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
import java.time.Period;
import java.util.UUID;


@Slf4j
@Service
public class PatientService {
    private final PatientRepository patientRepository;
    private final AccountService accountService;
    private final ImageService imageService;

    public PatientService(PatientRepository patientRepository, AccountService accountService, ImageService imageService) {
        this.patientRepository = patientRepository;
        this.accountService = accountService;
        this.imageService = imageService;
    }

    private LocalDate parseAndValidateDateOfBirth(String dateOfBirthStr) throws InvalidInputException {
        LocalDate dateOfBirth = DateTimeUtil.stringToLocalDate(dateOfBirthStr)
                .orElseThrow(() -> {
                    log.warn("Invalid date of birth format: {}", dateOfBirthStr);
                    return new InvalidInputException("Invalid date of birth format");
                });

        LocalDate today = LocalDate.now();

        if (dateOfBirth.isAfter(today)) {
            log.warn("Date of birth is in the future: {}", dateOfBirth);
            throw new InvalidInputException("Date of birth cannot be in the future");
        }

        Period age = Period.between(dateOfBirth, today);

        if (age.getYears() < 12) {
            log.warn("Date of birth indicates age less than 12: {}", dateOfBirth);
            throw new InvalidInputException("User must be at least 12 years old");
        }

        return dateOfBirth;
    }

    private Account createPatientAccount(String nric, String password) throws AppException {
        return accountService.createPatientAccount(nric, password)
                .orElseThrow(() -> {
                    log.warn("Failed to create patient account for patient with username: {}", nric);
                    return new AppException("Failed to account");
                });
    }

    private Patient buildPatient(CreatePatientRequestDto request, LocalDate dateOfBirth, Account account) {
        return Patient.builder()
                .name(request.name())
                .account(account)
                .nric(request.nric())
                .email(request.email())
                .serialNumber(request.serialNumber())
                .phone(request.phone())
                .dateOfBirth(dateOfBirth)
                .gender(request.gender())
                .build();
    }

    private void updatePatientDetails(Patient patient, UpdatePatientProfileRequestDto request, LocalDate dateOfBirth) {
        patient.setName(request.name());
        patient.setPhone(request.phone());
        patient.setEmail(request.email());
        patient.setDateOfBirth(dateOfBirth);
        patient.setGender(request.gender());
    }

    private void processProfileImage(MultipartFile profileImage, Patient patient) throws InvalidInputException, IOException, S3Exception {
        Image image = imageService.saveAndGetImage(ImageType.PROFILE, patient.getId(), profileImage);
        patient.setProfileImage(image);
        patientRepository.save(patient);
        log.info("Uploaded profile image for doctor with ID: {}", patient.getId());
    }

    @Transactional(readOnly = true)
    public Patient findPatientById(UUID patientId) throws ResourceNotFoundException {
        log.debug("Getting patient with ID: {}", patientId);

        return patientRepository.findById(patientId)
                .orElseThrow(() -> {
                    log.warn("Patient not found with ID: {}", patientId);
                    return new ResourceNotFoundException("Patient not found");
                });
    }

    @Transactional(readOnly = true)
    public Patient findPatientByEmail(String email) throws ResourceNotFoundException {
        log.debug("Getting patient with email: {}", email);

        return patientRepository.findByHashedEmail(HashUtil.sha256(email))
                .orElseThrow(() -> {
                    log.warn("Patient not found with email: {}", email);
                    return new ResourceNotFoundException("Patient not found");
                });
    }

    @Transactional(readOnly = true)
    public Patient findPatientByNric(String nric) throws ResourceNotFoundException {
        log.debug("Getting patient with NRIC: {}", nric);

        return patientRepository.findByHashedNric(HashUtil.sha256(nric))
                .orElseThrow(() -> {
                    log.warn("Patient not found with NRIC: {}", nric);
                    return new ResourceNotFoundException("Patient not found");
                });
    }

    @Transactional(readOnly = true)
    public Patient findPatientByAccountId(UUID accountId) throws ResourceNotFoundException {
        log.debug("Getting patient with account ID: {}", accountId);

        return patientRepository.findByAccountId(accountId)
                .orElseThrow(() -> {
                    log.warn("Patient not found with account ID: {}", accountId);
                    return new ResourceNotFoundException("Patient not found");
                });
    }

    @Transactional(readOnly = true)
    public Page<Patient> getAllPaginatedPatient(int page, int pageSize) throws AppException {
        log.debug("Getting all patients paginated with page: {} and page size: {}", page, pageSize);

        try {
            Pageable pageable = PageRequest.of(page, pageSize);
            return patientRepository.findAll(pageable);
        } catch (Exception e) {
            log.error("Unexpected error while getting all patients paginated: {}", e.getMessage(), e);
            throw new AppException("Failed to fetch patients");
        }
    }

    @Transactional
    public void resetEmailByAccountId(UUID accountId, String newEmail) {
        log.debug("Resetting patient email for account ID: {}", accountId);

        try {
            Patient patient = findPatientByAccountId(accountId);
            patient.setEmail(newEmail);
            patientRepository.save(patient);

            log.info("Reset patient email for account ID: {}", accountId);
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error while resetting patient email: {}", accountId, e);
            throw e;
        }
    }

    @Transactional
    public void createPatient(CreatePatientRequestDto request) {
        log.debug("Received request to create patient with request: {}", request);

        try {
            LocalDate dateOfBirth = parseAndValidateDateOfBirth(request.dateOfBirth());
            Account account = createPatientAccount(request.nric(), request.password());

            Patient patient = buildPatient(request, dateOfBirth, account);
            patientRepository.save(patient);

            log.info("Created patient with ID: {}", patient.getId());
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error while creating patient: {}", request, e);
            throw new AppException("Failed to create account");
        }
    }

    @Transactional
    public void updatePatientProfileByAccountId(UUID accountId, UpdatePatientProfileRequestDto request) throws AppException {
        log.debug("Received request to update patient profile with request: {}", request);
        try {
            Patient patient = findPatientByAccountId(accountId);
            LocalDate dateOfBirth = parseAndValidateDateOfBirth(request.dateOfBirth());

            updatePatientDetails(patient, request, dateOfBirth);
            patientRepository.save(patient);

            log.info("Updated patient with ID: {}", patient.getId());
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error while updating patient: {}", request, e);
            throw new AppException("Failed to update patient profile");
        }
    }

    @Transactional
    public void updatePatientProfileImageByAccountId(UUID accountId, MultipartFile profileImage) throws AppException {
        log.debug("Received request to update patient profile image with ID: {}", accountId);

        try {
            if (profileImage == null || profileImage.isEmpty()) {
                throw new InvalidInputException("Profile image is required");
            }

            Patient patient = findPatientByAccountId(accountId);

            processProfileImage(profileImage, patient);

            log.info("Updated patient profile image with ID: {}", patient.getId());
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error while updating patient profile image: {}", accountId, e);
            throw new AppException("Failed to update profile image");
        }
    }

    @Transactional
    public void deletePatientByPatientId(UUID patientId) throws AppException {
        log.debug("Received request to delete patient with ID: {}", patientId);

        try {
            Patient patient = findPatientById(patientId);

            patientRepository.delete(patient);

            log.info("Deleted patient with ID: {}", patient.getId());
        } catch(AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error while deleting patient: {}", patientId, e);
            throw new AppException("Failed to delete patient");
        }
    }
}
