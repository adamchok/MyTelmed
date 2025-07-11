package com.mytelmed.core.doctor.controller;

import com.mytelmed.common.dto.ApiResponse;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.doctor.dto.CreateDoctorRequestDto;
import com.mytelmed.core.doctor.dto.DoctorDto;
import com.mytelmed.core.doctor.dto.UpdateDoctorProfileRequestDto;
import com.mytelmed.core.doctor.dto.UpdateDoctorRequestDto;
import com.mytelmed.core.doctor.entity.Doctor;
import com.mytelmed.core.doctor.mapper.DoctorMapper;
import com.mytelmed.core.doctor.service.DoctorService;
import com.mytelmed.infrastructure.aws.service.AwsS3Service;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import java.util.UUID;


@Slf4j
@RestController
@RequestMapping("/api/v1/doctor")
public class DoctorController {
    private final DoctorMapper doctorMapper;
    private final DoctorService doctorService;
    private final AwsS3Service awsS3Service;

    public DoctorController(DoctorMapper doctorMapper, DoctorService doctorService, AwsS3Service awsS3Service) {
        this.doctorMapper = doctorMapper;
        this.doctorService = doctorService;
        this.awsS3Service = awsS3Service;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PATIENT')")
    public ResponseEntity<ApiResponse<Page<DoctorDto>>> getDoctors(
            @RequestParam Integer page,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize
    ) {
        log.info("Received request to get all doctors with page: {} and page size: {}", page, pageSize);

        Page<Doctor> paginatedDoctor = doctorService.findAll(page, pageSize);
        Page<DoctorDto> paginatedDoctorDto = paginatedDoctor.map(doctor -> doctorMapper.toDto(doctor, awsS3Service));
        return ResponseEntity.ok(ApiResponse.success(paginatedDoctorDto));
    }

    @GetMapping("/{doctorId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DoctorDto>> getDoctorById(@PathVariable UUID doctorId) {
        log.info("Received request to get doctor with ID: {}", doctorId);

        Doctor doctor = doctorService.findById(doctorId);
        DoctorDto doctorDto = doctorMapper.toDto(doctor, awsS3Service);
        return ResponseEntity.ok(ApiResponse.success(doctorDto));
    }

    @GetMapping("/profile")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<DoctorDto>> getDoctorProfile(@AuthenticationPrincipal Account account) {
        log.info("Received request to get doctor profile for account with ID: {}", account.getId());

        Doctor doctor = doctorService.findByAccount(account);
        DoctorDto doctorDto = doctorMapper.toDto(doctor, awsS3Service);
        return ResponseEntity.ok(ApiResponse.success(doctorDto));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> createDoctor(@Valid @RequestBody CreateDoctorRequestDto request) {
        log.info("Received request to create doctor with request: {}", request);

        doctorService.create(request);
        return ResponseEntity.ok(ApiResponse.success("Doctor created successfully"));
    }

    @PatchMapping("/profile")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<Void>> updateDoctorProfile(
            @Valid @RequestBody UpdateDoctorProfileRequestDto request,
            @AuthenticationPrincipal Account account
    ) {
        log.info("Received request to update doctor profile for account with ID: {}", account.getId());

        doctorService.updateByAccount(account, request);
        return ResponseEntity.ok(ApiResponse.success("Doctor profile updated successfully"));
    }

    @PatchMapping("/{doctorId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> updateDoctor(
            @Valid @RequestBody UpdateDoctorRequestDto request,
            @PathVariable UUID doctorId
    ) {
        log.info("Received request to update doctor with ID: {}", doctorId);

        doctorService.update(doctorId, request);
        return ResponseEntity.ok(ApiResponse.success("Doctor profile updated successfully"));
    }

    @PutMapping(value = "/profile/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<Void>> updateDoctorProfileImage(
            @RequestPart(value = "profileImage") MultipartFile profileImage,
            @AuthenticationPrincipal Account account
    ) {
        log.info("Received request to update doctor profile image for account with ID: {}", account.getId());

        doctorService.updateProfileImageByAccount(account, profileImage);
        return ResponseEntity.ok(ApiResponse.success("Doctor profile image updated successfully"));
    }

    @PostMapping(value = "/image/{doctorId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> uploadDoctorImage(
            @PathVariable UUID doctorId,
            @RequestPart(value = "profileImage") MultipartFile profileImage
    ) {
        log.info("Received request to upload image for doctor with ID: {}", doctorId);

        doctorService.uploadProfileImageById(doctorId, profileImage);
        return ResponseEntity.ok(ApiResponse.success("Doctor image uploaded successfully"));
    }

    @PostMapping("/activate/{doctorId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> activateDoctorById(@PathVariable UUID doctorId) {
        log.info("Received request to activate doctor with ID: {}", doctorId);

        doctorService.activateById(doctorId);
        return ResponseEntity.ok(ApiResponse.success("Doctor account activated successfully"));
    }

    @PostMapping("/deactivate/{doctorId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deactivateDoctorById(@PathVariable UUID doctorId) {
        log.info("Received request to deactivate doctor with ID: {}", doctorId);

        doctorService.deactivateById(doctorId);
        return ResponseEntity.ok(ApiResponse.success("Doctor account deactivated successfully"));
    }

    @PostMapping("/reset/password/{doctorId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> resetDoctorAccountPassword(@PathVariable UUID doctorId) {
        log.info("Received request to reset doctor account password for doctor with ID: {}", doctorId);

        doctorService.resetAccountPasswordById(doctorId);
        return ResponseEntity.ok(ApiResponse.success("Doctor account password reset successfully"));
    }
}
