package com.mytelmed.core.patient.controller;


import com.mytelmed.common.dto.ApiResponse;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.patient.dto.CreatePatientRequestDto;
import com.mytelmed.core.patient.dto.PatientDto;
import com.mytelmed.core.patient.dto.UpdatePatientProfileRequestDto;
import com.mytelmed.core.patient.entity.Patient;
import com.mytelmed.core.patient.mapper.PatientMapper;
import com.mytelmed.core.patient.service.PatientService;
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
@RequestMapping("/api/v1/patient")
public class PatientController {
    private final PatientService patientService;
    private final PatientMapper patientMapper;

    public PatientController(PatientService patientService, PatientMapper patientMapper) {
        this.patientService = patientService;
        this.patientMapper = patientMapper;
    }

    @GetMapping("/{patientId}")
    public ResponseEntity<ApiResponse<PatientDto>> getPatientById(@PathVariable UUID patientId) {
        log.info("Received request to get patient with ID: {}", patientId);

        Patient patient = patientService.findPatientById(patientId);
        PatientDto patientDto = patientMapper.toDto(patient);
        return ResponseEntity.ok(ApiResponse.success(patientDto));
    }

    @GetMapping("/account")
    public ResponseEntity<ApiResponse<PatientDto>> getPatientByAccountId(@AuthenticationPrincipal Account account) {
        log.info("Received request to get patient with Account ID: {}", account.getId());

        Patient patient = patientService.findPatientByAccountId(account.getId());
        PatientDto patientDto = patientMapper.toDto(patient);
        return ResponseEntity.ok(ApiResponse.success(patientDto));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<PatientDto>>> getAllPaginatedPatients(
            @RequestParam(value = "page", defaultValue = "0") Integer page,
            @RequestParam(value = "pageSize", defaultValue = "10") Integer pageSize
    ) {
        log.info("Received request to get all paginated patients");

        Page<Patient> paginatedPatient = patientService.getAllPaginatedPatient(page, pageSize);
        Page<PatientDto> paginatedPatientDto = paginatedPatient.map(patientMapper::toDto);
        return ResponseEntity.ok(ApiResponse.success(paginatedPatientDto));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Void>> createPatient(@Valid @RequestBody CreatePatientRequestDto request) {
        patientService.createPatient(request);
        return ResponseEntity.ok(ApiResponse.success("Registration successful"));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<Void>> updatePatientProfile(
            @RequestBody UpdatePatientProfileRequestDto request,
            @AuthenticationPrincipal Account account) {
        patientService.updatePatientProfileByAccountId(account.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully"));
    }

    @PutMapping(value = "/profile/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Void>> uploadPatientProfileImage(
            @RequestPart(value = "profileImage") MultipartFile profileImage,
            @AuthenticationPrincipal Account account) {
        patientService.updatePatientProfileImageByAccountId(account.getId(), profileImage);
        return ResponseEntity.ok(ApiResponse.success("Profile image updated successfully"));
    }

    @DeleteMapping("/{patientId}")
    public ResponseEntity<ApiResponse<Void>> deletePatient(@PathVariable UUID patientId) {
        patientService.deletePatientByPatientId(patientId);
        return ResponseEntity.ok(ApiResponse.success("Patient deleted successfully"));
    }
}
