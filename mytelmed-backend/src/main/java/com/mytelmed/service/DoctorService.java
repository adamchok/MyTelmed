package com.mytelmed.service;

import com.mytelmed.advice.exception.ResourceNotFoundException;
import com.mytelmed.advice.exception.UserAlreadyExistsException;
import com.mytelmed.constant.EntityType;
import com.mytelmed.constant.GenderType;
import com.mytelmed.constant.PermissionType;
import com.mytelmed.constant.SpecializationType;
import com.mytelmed.mapper.DoctorMapper;
import com.mytelmed.model.dto.DoctorDto;
import com.mytelmed.model.entity.Department;
import com.mytelmed.model.entity.Doctor;
import com.mytelmed.model.entity.Facility;
import com.mytelmed.model.entity.files.Image;
import com.mytelmed.model.entity.security.User;
import com.mytelmed.repository.DepartmentRepository;
import com.mytelmed.repository.DoctorRepository;
import com.mytelmed.repository.FacilityRepository;
import com.mytelmed.service.security.UserService;
import com.mytelmed.utils.BlindIndex;
import com.mytelmed.utils.DateTimeUtil;
import com.mytelmed.utils.PasswordGenerator;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;


@Service
@Slf4j
public class DoctorService {
    private final PasswordEncoder passwordEncoder;
    private final DoctorRepository doctorRepository;
    private final UserService userService;
    private final ImageService imageService;
    private final DepartmentRepository departmentRepository;
    private final FacilityRepository facilityRepository;
    private final DoctorMapper doctorMapper;

    public DoctorService(PasswordEncoder passwordEncoder, DoctorRepository doctorRepository,
                         UserService userService, ImageService imageService, DepartmentRepository departmentRepository,
                         FacilityRepository facilityRepository, DoctorMapper doctorMapper) {
        this.passwordEncoder = passwordEncoder;
        this.doctorRepository = doctorRepository;
        this.userService = userService;
        this.imageService = imageService;
        this.departmentRepository = departmentRepository;
        this.facilityRepository = facilityRepository;
        this.doctorMapper = doctorMapper;
    }

    public List<DoctorDto> getAllDoctors() {
        return doctorRepository.findAll().stream()
                .map(doctorMapper::toDto)
                .toList();
    }

    public Page<DoctorDto> getPaginatedDoctors(int page, int pageSize) {
        Pageable pageable = PageRequest.of(page, pageSize);
        return doctorRepository.findAll(pageable).map(doctorMapper::toDto);
    }

    public Optional<Doctor> createDoctorAccount(DoctorDto doctorDto, String departmentId, String facilityId,
                                            MultipartFile imageFile) {
        String hashedEmail = BlindIndex.sha256(doctorDto.email());

        if (userService.isUserExists(doctorDto.email()) ||
                doctorRepository.findByEmailHash(hashedEmail).isPresent()) {
            log.error("Account with this email already exists: {}", doctorDto.email());
            throw new UserAlreadyExistsException("Account with this email already exists.");
        }

        Department department = departmentRepository.findById(UUID.fromString(departmentId))
                .orElseThrow(() -> new IllegalArgumentException("Department not found with id: " + departmentId));

        Facility facility = facilityRepository.findById(UUID.fromString(facilityId))
                .orElseThrow(() -> new IllegalArgumentException("Facility not found with id: " + facilityId));

        User user = userService.createAndReturnUser(User.builder()
                .username(doctorDto.email())
                .password(passwordEncoder.encode(PasswordGenerator.generateSecurePassword(doctorDto.name())))
                .build(), PermissionType.DOCTOR);

        LocalDate dob = DateTimeUtil.toLocalDate(doctorDto.dob());

        Doctor doctor = Doctor.builder()
                .name(doctorDto.name())
                .nric(doctorDto.nric())
                .email(doctorDto.email())
                .phone(doctorDto.phone())
                .serialNumber(doctorDto.serialNumber())
                .gender(GenderType.valueOf(doctorDto.gender().toUpperCase()))
                .dob(dob)
                .user(user)
                .department(department)
                .facility(facility)
                .specialization(SpecializationType.valueOf(doctorDto.specialization().toUpperCase()))
                .description(doctorDto.description())
                .build();

        doctor = doctorRepository.save(doctor);

        if (imageFile != null && !imageFile.isEmpty()) {
            Image image = imageService.saveImage(EntityType.DOCTOR, doctor.getId(), imageFile, true)
                    .orElseThrow(() -> new RuntimeException("Failed to save image"));
            doctor.setImage(image);
        }

        return Optional.of(doctorRepository.save(doctor));
    }

    public Optional<Doctor> uploadImage(String doctorId, MultipartFile imageFile) {
        Doctor doctor = doctorRepository.findById(UUID.fromString(doctorId))
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found: " + doctorId));

        if (imageFile != null && !imageFile.isEmpty()) {
            Image image = imageService.saveImage(EntityType.DOCTOR, doctor.getId(), imageFile, true)
                    .orElseThrow(() -> new RuntimeException("Failed to save image"));
            doctor.setImage(image);
        }

        return Optional.of(doctorRepository.save(doctor));
    }
}