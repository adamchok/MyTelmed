package com.mytelmed.core.prescription.controller;

import com.mytelmed.common.constant.prescription.PrescriptionStatus;
import com.mytelmed.common.dto.ApiResponse;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.prescription.dto.CreatePrescriptionRequestDto;
import com.mytelmed.core.prescription.dto.PrescriptionDto;
import com.mytelmed.core.prescription.entity.Prescription;
import com.mytelmed.core.prescription.mapper.PrescriptionMapper;
import com.mytelmed.core.prescription.service.PrescriptionService;
import com.mytelmed.infrastructure.aws.service.AwsS3Service;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/prescriptions")
public class PrescriptionController {
    private final PrescriptionService prescriptionService;
    private final PrescriptionMapper prescriptionMapper;
    private final AwsS3Service awsS3Service;

    public PrescriptionController(PrescriptionService prescriptionService, PrescriptionMapper prescriptionMapper,
            AwsS3Service awsS3Service) {
        this.prescriptionService = prescriptionService;
        this.prescriptionMapper = prescriptionMapper;
        this.awsS3Service = awsS3Service;
    }

    @GetMapping("/{prescriptionId}")
    public ResponseEntity<ApiResponse<PrescriptionDto>> getPrescriptionById(
            @PathVariable UUID prescriptionId) {
        log.info("Received request to fetch prescription by ID: {}", prescriptionId);

        Prescription prescription = prescriptionService.findById(prescriptionId);
        PrescriptionDto prescriptionDto = prescriptionMapper.toDto(prescription, awsS3Service);
        return ResponseEntity.ok(ApiResponse.success(prescriptionDto));
    }

    @GetMapping("/number/{prescriptionNumber}")
    public ResponseEntity<ApiResponse<PrescriptionDto>> getPrescriptionByPrescriptionNumber(
            @PathVariable String prescriptionNumber) {
        log.info("Fetching prescription by number: {}", prescriptionNumber);

        Prescription prescription = prescriptionService.findByPrescriptionNumber(prescriptionNumber);
        PrescriptionDto prescriptionDto = prescriptionMapper.toDto(prescription, awsS3Service);
        return ResponseEntity.ok(ApiResponse.success(prescriptionDto));
    }

    @GetMapping("/facility/{facilityId}/number/{prescriptionNumber}")
    public ResponseEntity<ApiResponse<PrescriptionDto>> getPrescriptionByFacilityAndNumber(
            @PathVariable UUID facilityId,
            @PathVariable String prescriptionNumber) {
        log.info("Fetching prescription by facility: {} and number: {}", facilityId, prescriptionNumber);

        Prescription prescription = prescriptionService
                .findByFacilityIdAndPrescriptionNumber(facilityId, prescriptionNumber);
        PrescriptionDto prescriptionDto = prescriptionMapper.toDto(prescription, awsS3Service);

        return ResponseEntity.ok(ApiResponse.success(prescriptionDto));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<ApiResponse<Page<PrescriptionDto>>> getPrescriptionsByPatient(
            @PathVariable UUID patientId,
            @PageableDefault(size = 20) Pageable pageable) {
        log.info("Fetching prescriptions for patient: {}", patientId);

        Page<Prescription> prescriptionPage = prescriptionService.findByPatientId(patientId, pageable);
        Page<PrescriptionDto> prescriptionDtoPage = prescriptionPage
                .map(prescription -> prescriptionMapper.toDto(prescription, awsS3Service));

        return ResponseEntity.ok(ApiResponse.success(prescriptionDtoPage));
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<ApiResponse<Page<PrescriptionDto>>> getPrescriptionsByDoctor(
            @PathVariable UUID doctorId,
            @PageableDefault(size = 20) Pageable pageable) {
        log.info("Fetching prescriptions by doctor: {}", doctorId);

        Page<Prescription> prescriptions = prescriptionService.findByDoctorId(doctorId, pageable);
        Page<PrescriptionDto> response = prescriptions
                .map(prescription -> prescriptionMapper.toDto(prescription, awsS3Service));

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/facility/{facilityId}")
    public ResponseEntity<ApiResponse<Page<PrescriptionDto>>> getPrescriptionsByFacility(
            @PathVariable UUID facilityId,
            @PageableDefault(size = 20) Pageable pageable) {
        log.info("Fetching prescriptions by facility: {}", facilityId);

        Page<Prescription> prescriptions = prescriptionService.findByFacilityId(facilityId, pageable);
        Page<PrescriptionDto> response = prescriptions
                .map(prescription -> prescriptionMapper.toDto(prescription, awsS3Service));

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/pharmacist/{pharmacistId}")
    public ResponseEntity<ApiResponse<Page<PrescriptionDto>>> getPrescriptionsByPharmacist(
            @PathVariable UUID pharmacistId,
            @PageableDefault(size = 20) Pageable pageable) {
        log.info("Fetching prescriptions by pharmacist: {}", pharmacistId);

        Page<Prescription> prescriptions = prescriptionService.findByPharmacistId(pharmacistId, pageable);
        Page<PrescriptionDto> response = prescriptions
                .map(prescription -> prescriptionMapper.toDto(prescription, awsS3Service));

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<Page<PrescriptionDto>>> getPrescriptionsByStatus(
            @PathVariable PrescriptionStatus status,
            @PageableDefault(size = 20) Pageable pageable) {
        log.info("Fetching prescriptions by status: {}", status);

        Page<Prescription> prescriptions = prescriptionService.findByStatus(status, pageable);
        Page<PrescriptionDto> response = prescriptions
                .map(prescription -> prescriptionMapper.toDto(prescription, awsS3Service));

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PrescriptionDto>> createPrescription(
            @Valid @RequestBody CreatePrescriptionRequestDto request,
            @AuthenticationPrincipal Account account) {
        log.info("Received request to create prescription for appointment: {}", request.appointmentId());

        Prescription prescription = prescriptionService.createPrescription(account, request);
        PrescriptionDto prescriptionDto = prescriptionMapper.toDto(prescription, awsS3Service);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(prescriptionDto));
    }

    @PutMapping("/{prescriptionId}/ready-for-processing")
    public ResponseEntity<ApiResponse<Void>> markAsReadyForProcessing(
            @PathVariable UUID prescriptionId,
            @AuthenticationPrincipal Account account) {
        log.info("Patient marking prescription as ready for processing: {}", prescriptionId);

        prescriptionService.markAsReadyForProcessing(prescriptionId, account);

        return ResponseEntity.ok(ApiResponse.success("Prescription marked as ready for processing"));
    }

    @PutMapping("/{prescriptionId}/start-processing")
    public ResponseEntity<ApiResponse<Void>> startProcessing(
            @PathVariable UUID prescriptionId,
            @AuthenticationPrincipal Account account) {
        log.info("Pharmacist starting to process prescription: {}", prescriptionId);

        prescriptionService.startProcessing(prescriptionId, account);

        return ResponseEntity.ok(ApiResponse.success("Prescription processing started"));
    }

    @PutMapping("/{prescriptionId}/complete")
    public ResponseEntity<ApiResponse<Void>> markAsCompleted(
            @PathVariable UUID prescriptionId,
            @AuthenticationPrincipal Account account) {
        log.info("Pharmacist completing prescription: {}", prescriptionId);

        prescriptionService.markAsCompleted(prescriptionId, account);

        return ResponseEntity.ok(ApiResponse.success("Prescription completed successfully"));
    }

    @PutMapping("/{prescriptionId}/expire")
    public ResponseEntity<ApiResponse<Void>> markAsExpired(
            @PathVariable UUID prescriptionId) {
        log.info("Marking prescription as expired: {}", prescriptionId);

        prescriptionService.markAsExpired(prescriptionId);

        return ResponseEntity.ok(ApiResponse.success("Prescription marked as expired"));
    }

    @PutMapping("/{prescriptionId}/cancel")
    public ResponseEntity<ApiResponse<Void>> cancelPrescription(
            @PathVariable UUID prescriptionId,
            @RequestBody String reason) {
        log.info("Cancelling prescription: {}", prescriptionId);

        prescriptionService.cancelPrescription(prescriptionId, reason);

        return ResponseEntity.ok(ApiResponse.success("Prescription cancelled successfully"));
    }
}
