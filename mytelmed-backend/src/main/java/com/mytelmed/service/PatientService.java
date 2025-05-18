package com.mytelmed.service;

import com.mytelmed.advice.exception.UnverifiedEmailException;
import com.mytelmed.advice.exception.UserAlreadyExistsException;
import com.mytelmed.constant.GenderType;
import com.mytelmed.constant.PermissionType;
import com.mytelmed.mapper.patient.PatientMapper;
import com.mytelmed.model.dto.PatientDto;
import com.mytelmed.model.dto.request.RegistrationRequestDto;
import com.mytelmed.model.entity.object.Patient;
import com.mytelmed.model.entity.security.User;
import com.mytelmed.repository.PatientRepository;
import com.mytelmed.service.security.UserService;
import com.mytelmed.service.security.VerificationService;
import com.mytelmed.utils.BlindIndex;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;


@Service
@Slf4j
public class PatientService {
    private final PasswordEncoder passwordEncoder;
    private final PatientRepository patientRepository;
    private final UserService userService;
    private final PatientMapper patientMapper;
    private final VerificationService verificationService;

    public PatientService(PasswordEncoder passwordEncoder, PatientRepository patientRepository,
                          UserService userService, PatientMapper patientMapper, VerificationService verificationService) {
        this.passwordEncoder = passwordEncoder;
        this.patientRepository = patientRepository;
        this.userService = userService;
        this.patientMapper = patientMapper;
        this.verificationService = verificationService;
    }

    public boolean isPatientEmailExists(String email) {
        return patientRepository.findByEmailHash(email).isPresent();
    }

    public List<PatientDto> getAllPatients() {
        return patientRepository.findAll().stream()
                .map(patientMapper::toDto)
                .toList();
    }

    @Transactional
    public void createPatientAccount(RegistrationRequestDto registrationRequestDto) {
        String hashedNric = BlindIndex.sha256(registrationRequestDto.nric());

        if (userService.isUserExists(registrationRequestDto.nric()) ||
                patientRepository.findByNricHash(hashedNric).isPresent()) {
            log.error("Account with this NRIC already exists: {}", registrationRequestDto.nric());
            throw new UserAlreadyExistsException("Account with this NRIC already exists");
        }

        if (!verificationService.isEmailVerified(registrationRequestDto.email())) {
            log.error("Email not verified: {}", registrationRequestDto.email());
            throw new UnverifiedEmailException("Email not verified.");
        }

        User user = userService.createAndReturnUser(User.builder()
                .username(registrationRequestDto.nric())
                .password(passwordEncoder.encode(registrationRequestDto.password()))
                .build(), PermissionType.PATIENT);

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        LocalDate dob = LocalDate.parse(registrationRequestDto.dob(), formatter);

        Patient patient = Patient.builder()
                .user(user)
                .name(registrationRequestDto.name())
                .nric(registrationRequestDto.nric())
                .serialNumber(registrationRequestDto.serialNumber())
                .email(registrationRequestDto.email())
                .phone(registrationRequestDto.phone())
                .gender(GenderType.valueOf(registrationRequestDto.gender().toUpperCase()))
                .dateOfBirth(dob)
                .build();

        patientRepository.save(patient);
    }
}
