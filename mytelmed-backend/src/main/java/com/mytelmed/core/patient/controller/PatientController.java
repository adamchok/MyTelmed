package com.mytelmed.core.patient.controller;

import com.mytelmed.common.dto.ApiResponse;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.patient.dto.CreatePatientRequestDto;
import com.mytelmed.core.patient.dto.PatientDto;
import com.mytelmed.core.patient.dto.UpdatePatientProfileRequestDto;
import com.mytelmed.core.patient.entity.Patient;
import com.mytelmed.core.patient.mapper.PatientMapper;
import com.mytelmed.core.patient.service.PatientService;
import com.mytelmed.infrastructure.aws.service.AwsS3Service;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
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
@RequestMapping("/api/v1/patient")
public class PatientController {
    private final PatientService patientService;
    private final PatientMapper patientMapper;
    private final AwsS3Service awsS3Service;

    public PatientController(PatientService patientService, PatientMapper patientMapper, AwsS3Service awsS3Service) {
        this.patientService = patientService;
        this.patientMapper = patientMapper;
        this.awsS3Service = awsS3Service;
    }

    @GetMapping("/{patientId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PatientDto>> getPatientById(@PathVariable UUID patientId) {
        log.info("Received request to get patient with ID: {}", patientId);

        Patient patient = patientService.findPatientById(patientId);
        PatientDto patientDto = patientMapper.toDto(patient, awsS3Service);
        return ResponseEntity.ok(ApiResponse.success(patientDto));
    }

    @GetMapping("/profile")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<PatientDto>> getPatientByAccountId(@AuthenticationPrincipal Account account) {
        log.info("Received request to get patient with Account ID: {}", account.getId());

        Patient patient = patientService.findPatientByAccountId(account.getId());
        PatientDto patientDto = patientMapper.toDto(patient, awsS3Service);
        return ResponseEntity.ok(ApiResponse.success(patientDto));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<PatientDto>>> getAllPatients(
            @RequestParam(value = "page") Integer page,
            @RequestParam(value = "pageSize", defaultValue = "10") Integer pageSize) {
        log.info("Received request to get all paginated patients");

        Page<Patient> paginatedPatient = patientService.getAllPaginatedPatient(page, pageSize);
        Page<PatientDto> paginatedPatientDto = paginatedPatient
                .map(patient -> patientMapper.toDto(patient, awsS3Service));
        return ResponseEntity.ok(ApiResponse.success(paginatedPatientDto));
    }

    // Open endpoint
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Void>> createPatient(@Valid @RequestBody CreatePatientRequestDto request) {
        patientService.createPatient(request);
        return ResponseEntity.ok(ApiResponse.success("Registration successful"));
    }

    @PatchMapping("/profile")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<Void>> updatePatientProfile(
            @RequestBody UpdatePatientProfileRequestDto request,
            @AuthenticationPrincipal Account account) {
        patientService.updatePatientProfileByAccountId(account.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully"));
    }

    @PutMapping(value = "/profile/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<Void>> uploadPatientProfileImage(
            @RequestPart(value = "profileImage") MultipartFile profileImage,
            @AuthenticationPrincipal Account account) {
        patientService.updatePatientProfileImageByAccountId(account.getId(), profileImage);
        return ResponseEntity.ok(ApiResponse.success("Profile image updated successfully"));
    }

    @DeleteMapping("/{patientId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deletePatient(@PathVariable UUID patientId) {
        patientService.deletePatientByPatientId(patientId);
        return ResponseEntity.ok(ApiResponse.success("Patient deleted successfully"));
    }

    @PostMapping("/activate/{patientId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> activatePharmacistById(@PathVariable UUID patientId) {
        log.info("Received request to activate patient with ID: {}", patientId);

        patientService.activatePatientById(patientId);
        return ResponseEntity.ok(ApiResponse.success("Patient account activated successfully"));
    }

    @PostMapping("/deactivate/{patientId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deactivatePharmacistById(@PathVariable UUID patientId) {
        log.info("Received request to deactivate patient with ID: {}", patientId);

        patientService.deactivatePatientById(patientId);
        return ResponseEntity.ok(ApiResponse.success("Patient account deactivated successfully"));
    }

    @PostMapping("/reset/password/{patientId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> resetPharmacistAccountPassword(@PathVariable UUID patientId) {
        log.info("Received request to reset patient account password for patient with ID: {}", patientId);

        patientService.resetPatientAccountPasswordById(patientId);
        return ResponseEntity.ok(ApiResponse.success("Patient account password reset successfully"));
    }
}
