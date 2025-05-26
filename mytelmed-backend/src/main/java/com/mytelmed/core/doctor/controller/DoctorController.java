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

    public DoctorController(DoctorMapper doctorMapper, DoctorService doctorService) {
        this.doctorMapper = doctorMapper;
        this.doctorService = doctorService;
    }
    
    @GetMapping("/{doctorId}")
    public ResponseEntity<ApiResponse<DoctorDto>> getDoctorById(@PathVariable UUID doctorId) {
        Doctor doctor = doctorService.findDoctorById(doctorId);
        DoctorDto doctorDto = doctorMapper.toDto(doctor);
        return ResponseEntity.ok(ApiResponse.success(doctorDto));
    }
    
    @GetMapping("/account/{accountId}")
    public ResponseEntity<ApiResponse<DoctorDto>> getDoctorByAccountId(@PathVariable UUID accountId) {
        Doctor doctor = doctorService.findDoctorByAccountId(accountId);
        DoctorDto doctorDto = doctorMapper.toDto(doctor);
        return ResponseEntity.ok(ApiResponse.success(doctorDto));
    }
    
    @GetMapping
    public ResponseEntity<ApiResponse<Page<DoctorDto>>> getAllDoctors(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<DoctorDto> doctorDtoPage = doctorService.findAllPaginatedDoctors(page, size)
                .map(doctorMapper::toDto);
        return ResponseEntity.ok(ApiResponse.success(doctorDtoPage));
    }
    
    @GetMapping("/speciality")
    public ResponseEntity<ApiResponse<Page<DoctorDto>>> getDoctorsBySpeciality(
            @RequestParam String speciality,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<DoctorDto> doctorDtoPage = doctorService.findAllPaginatedDoctorsBySpeciality(speciality, page, size)
                .map(doctorMapper::toDto);
        return ResponseEntity.ok(ApiResponse.success(doctorDtoPage));
    }

    @GetMapping("/facility/{facilityId}")
    public ResponseEntity<ApiResponse<Page<DoctorDto>>> getDoctorsByFacilityId(
            @PathVariable UUID facilityId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<DoctorDto> doctorDtoPage = doctorService.findAllPaginatedDoctorsByFacilityId(facilityId, page, size)
                .map(doctorMapper::toDto);
        return ResponseEntity.ok(ApiResponse.success(doctorDtoPage));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Void>> createDoctor(
            @RequestPart("doctor") CreateDoctorRequestDto request,
            @RequestPart(value = "profileImage", required = false) MultipartFile profileImage) {
        doctorService.createDoctor(request, profileImage);
        return ResponseEntity.ok(ApiResponse.success("Doctor created successfully"));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<Void>> updateDoctorProfile(
            @RequestBody UpdateDoctorProfileRequestDto request,
            @AuthenticationPrincipal Account account) {
        doctorService.updateDoctorProfileByAccountId(account.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully"));
    }

    @PutMapping(value = "/profile/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Void>> uploadDoctorProfileImage(
            @RequestPart(value = "profileImage") MultipartFile profileImage,
            @AuthenticationPrincipal Account account) {
        doctorService.updateDoctorProfileImageByAccountId(account.getId(), profileImage);
        return ResponseEntity.ok(ApiResponse.success("Doctor profile image updated successfully"));
    }

    @PutMapping("/{doctorId}/specialities-facility")
    public ResponseEntity<ApiResponse<Void>> updateDoctorSpecialitiesAndFacility(
            @PathVariable UUID doctorId,
            @RequestBody UpdateDoctorSpecialitiesAndFacilityRequestDto request) {
        doctorService.updateDoctorSpecialitiesAndFacilityByDoctorId(doctorId, request);
        return ResponseEntity.ok(ApiResponse.success("Doctor specialities and facility updated successfully"));
    }

    @DeleteMapping("/{doctorId}")
    public ResponseEntity<ApiResponse<Void>> deleteDoctor(@PathVariable UUID doctorId) {
        doctorService.deleteDoctorByDoctorId(doctorId);
        return ResponseEntity.ok(ApiResponse.success("Doctor deleted successfully"));
    }
}