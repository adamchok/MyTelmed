package com.mytelmed.core.doctor.controller;

import com.mytelmed.common.dto.ApiResponse;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.doctor.dto.CreateDoctorRequestDto;
import com.mytelmed.core.doctor.dto.DoctorDto;
import com.mytelmed.core.doctor.dto.UpdateDoctorProfileRequestDto;
import com.mytelmed.core.doctor.dto.UpdateDoctorSpecialitiesAndFacilityRequestDto;
import com.mytelmed.core.doctor.entity.Doctor;
import com.mytelmed.core.doctor.mapper.DoctorMapper;
import com.mytelmed.core.doctor.service.DoctorService;
import com.mytelmed.infrastructure.aws.service.AwsS3Service;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
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
    public ResponseEntity<ApiResponse<Page<DoctorDto>>> getAllDoctors(
            @RequestParam Integer page,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize) {
        log.info("Received request to get all doctors with page: {} and page size: {}", page, pageSize);

        Page<Doctor> paginatedDoctor = doctorService.findAll(page, pageSize);
        Page<DoctorDto> paginatedDoctorDto = paginatedDoctor.map(doctor -> doctorMapper.toDto(doctor, awsS3Service));
        return ResponseEntity.ok(ApiResponse.success(paginatedDoctorDto));
    }

    @GetMapping("/facility/{facilityId}")
    public ResponseEntity<ApiResponse<Page<DoctorDto>>> getDoctorsByFacilityId(
            @PathVariable UUID facilityId,
            @RequestParam Integer page,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize) {
        log.info("Received request to get doctors by facility ID: {} with page: {} and page size: {}", facilityId,
                page, pageSize);

        Page<Doctor> paginatedDoctor = doctorService.findAllByFacilityId(facilityId, page, pageSize);
        Page<DoctorDto> paginatedDoctorDto = paginatedDoctor.map(doctor -> doctorMapper.toDto(doctor, awsS3Service));
        return ResponseEntity.ok(ApiResponse.success(paginatedDoctorDto));
    }

    @GetMapping("/speciality")
    public ResponseEntity<ApiResponse<Page<DoctorDto>>> getDoctorsBySpeciality(
            @RequestParam String speciality,
            @RequestParam Integer page,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize) {
        log.info("Received request to get doctors by speciality: {} with page: {} and page size: {}", speciality,
                page, pageSize);

        Page<Doctor> paginatedDoctor = doctorService.findAllBySpeciality(speciality, page, pageSize);
        Page<DoctorDto> paginatedDoctorDto = paginatedDoctor.map(doctor -> doctorMapper.toDto(doctor, awsS3Service));
        return ResponseEntity.ok(ApiResponse.success(paginatedDoctorDto));
    }

    @GetMapping("/{doctorId}")
    public ResponseEntity<ApiResponse<DoctorDto>> getDoctorById(@PathVariable UUID doctorId) {
        log.info("Received request to get doctor with ID: {}", doctorId);

        Doctor doctor = doctorService.findById(doctorId);
        DoctorDto doctorDto = doctorMapper.toDto(doctor, awsS3Service);
        return ResponseEntity.ok(ApiResponse.success(doctorDto));
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<DoctorDto>> getDoctorProfile(@AuthenticationPrincipal Account account) {
        log.info("Received request to get doctor profile for account with ID: {}", account.getId());

        Doctor doctor = doctorService.findByAccount(account);
        DoctorDto doctorDto = doctorMapper.toDto(doctor, awsS3Service);
        return ResponseEntity.ok(ApiResponse.success(doctorDto));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DoctorDto>> createDoctor(
            @Valid @RequestBody CreateDoctorRequestDto request) {
        log.info("Received request to create doctor with request: {}", request);

        Doctor doctor = doctorService.create(request);
        DoctorDto doctorDto = doctorMapper.toDto(doctor, awsS3Service);
        return ResponseEntity.ok(ApiResponse.success(doctorDto, "Doctor created successfully"));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<Void>> updateDoctorProfile(
            @Valid @RequestBody UpdateDoctorProfileRequestDto request,
            @AuthenticationPrincipal Account account) {
        log.info("Received request to update doctor profile for account with ID: {}", account.getId());

        doctorService.updateByAccount(account, request);
        return ResponseEntity.ok(ApiResponse.success("Doctor profile updated successfully"));
    }

    @PutMapping(value = "/profile/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Void>> updateDoctorProfileImage(
            @RequestPart(value = "profileImage") MultipartFile profileImage,
            @AuthenticationPrincipal Account account) {
        log.info("Received request to update doctor profile image for account with ID: {}", account.getId());

        doctorService.updateProfileImageByAccount(account, profileImage);
        return ResponseEntity.ok(ApiResponse.success("Doctor profile image updated successfully"));
    }

    @PutMapping("/specialities-facility/{doctorId}")
    public ResponseEntity<ApiResponse<Void>> updateDoctorSpecialitiesAndFacility(
            @PathVariable UUID doctorId,
            @Valid @RequestBody UpdateDoctorSpecialitiesAndFacilityRequestDto request) {
        log.info("Received request to update doctor specialities and facility for doctor with ID: {}", doctorId);

        doctorService.updateSpecialitiesAndFacilityById(doctorId, request);
        return ResponseEntity.ok(ApiResponse.success("Doctor specialities and facility updated successfully"));
    }

    @PostMapping(value = "/image/{doctorId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Void>> uploadDoctorImage(
            @PathVariable UUID doctorId,
            @RequestPart(value = "profileImage") MultipartFile profileImage) {
        log.info("Received request to upload image for doctor with ID: {}", doctorId);

        doctorService.uploadProfileImageById(doctorId, profileImage);
        return ResponseEntity.ok(ApiResponse.success("Doctor image uploaded successfully"));
    }

    @DeleteMapping("/{doctorId}")
    public ResponseEntity<ApiResponse<Void>> deleteDoctor(@PathVariable UUID doctorId) {
        log.info("Received request to delete doctor with ID: {}", doctorId);

        doctorService.deleteById(doctorId);
        return ResponseEntity.ok(ApiResponse.success("Doctor deleted successfully"));
    }

    @PostMapping("/activate/{doctorId}")
    public ResponseEntity<ApiResponse<Void>> activateDoctorById(@PathVariable UUID doctorId) {
        log.info("Received request to activate doctor with ID: {}", doctorId);

        doctorService.activateById(doctorId);
        return ResponseEntity.ok(ApiResponse.success("Doctor account activated successfully"));
    }

    @PostMapping("/deactivate/{doctorId}")
    public ResponseEntity<ApiResponse<Void>> deactivateDoctorById(@PathVariable UUID doctorId) {
        log.info("Received request to deactivate doctor with ID: {}", doctorId);

        doctorService.deactivateById(doctorId);
        return ResponseEntity.ok(ApiResponse.success("Doctor account deactivated successfully"));
    }

    @PostMapping("/reset/password/{doctorId}")
    public ResponseEntity<ApiResponse<Void>> resetDoctorAccountPassword(@PathVariable UUID doctorId) {
        log.info("Received request to reset doctor account password for doctor with ID: {}", doctorId);

        doctorService.resetAccountPassword(doctorId);
        return ResponseEntity.ok(ApiResponse.success("Doctor account password reset successfully"));
    }
}
