package com.mytelmed.core.referral.controller;

import com.mytelmed.common.dto.ApiResponse;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.referral.dto.CreateReferralRequestDto;
import com.mytelmed.core.referral.dto.ReferralDto;
import com.mytelmed.core.referral.dto.ReferralStatisticsDto;
import com.mytelmed.core.referral.dto.UpdateReferralStatusRequestDto;
import com.mytelmed.core.referral.entity.Referral;
import com.mytelmed.core.referral.mapper.ReferralMapper;
import com.mytelmed.core.referral.service.ReferralService;
import com.mytelmed.infrastructure.aws.service.AwsS3Service;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.util.UUID;


@Slf4j
@RestController
@RequestMapping("/api/v1/referral")
public class ReferralController {
    private final ReferralService referralService;
    private final ReferralMapper referralMapper;
    private final AwsS3Service awsS3Service;

    public ReferralController(ReferralService referralService, ReferralMapper referralMapper, AwsS3Service awsS3Service) {
        this.referralService = referralService;
        this.referralMapper = referralMapper;
        this.awsS3Service = awsS3Service;
    }

    @PostMapping
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<Void>> createReferral(
            @Valid @RequestBody CreateReferralRequestDto request,
            @AuthenticationPrincipal Account account
    ) {
        log.info("Creating referral for patient: {}", request.patientId());

        referralService.createReferral(account, request);

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Referral created successfully"));
    }

    @GetMapping("/{referralId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'PATIENT')")
    public ResponseEntity<ApiResponse<ReferralDto>> getReferralById(@PathVariable UUID referralId) {
        log.info("Fetching referral by ID: {}", referralId);

        Referral referral = referralService.findById(referralId);
        ReferralDto referralDto = referralMapper.toDto(referral, awsS3Service);

        return ResponseEntity.ok(ApiResponse.success(referralDto));
    }

    @GetMapping("/number/{referralNumber}")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR')")
    public ResponseEntity<ApiResponse<ReferralDto>> getReferralByNumber(@PathVariable String referralNumber) {
        log.info("Fetching referral by number: {}", referralNumber);

        Referral referral = referralService.findByReferralNumber(referralNumber);
        ReferralDto referralDto = referralMapper.toDto(referral, awsS3Service);

        return ResponseEntity.ok(ApiResponse.success(referralDto));
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<Page<ReferralDto>>> getReferralsByPatient(
            @PathVariable UUID patientId,
            @PageableDefault(size = 20) Pageable pageable,
            @AuthenticationPrincipal Account account) {
        log.info("Fetching referrals for patient: {}", patientId);

        Page<Referral> referralPage = referralService.findByPatientId(patientId, account, pageable);
        Page<ReferralDto> referralDtoPage = referralPage.map(referral -> referralMapper.toDto(referral, awsS3Service));

        return ResponseEntity.ok(ApiResponse.success(referralDtoPage));
    }

    @GetMapping("/referring")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<Page<ReferralDto>>> getReferralsByReferringDoctor(
            @AuthenticationPrincipal Account account,
            @PageableDefault(size = 20) Pageable pageable) {
        log.info("Fetching referrals by referring doctor: {}", account.getId());

        Page<Referral> referralPage = referralService.findByReferringDoctor(account, pageable);
        Page<ReferralDto> referralDtoPage = referralPage.map(referral -> referralMapper.toDto(referral, awsS3Service));

        return ResponseEntity.ok(ApiResponse.success(referralDtoPage));
    }

    @GetMapping("/referred")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<Page<ReferralDto>>> getReferralsByReferredDoctor(
            @AuthenticationPrincipal Account account,
            @PageableDefault(size = 20) Pageable pageable) {
        log.info("Fetching referrals by referred doctor: {}", account.getId());

        Page<Referral> referralPage = referralService.findByReferredDoctor(account, pageable);
        Page<ReferralDto> referralDtoPage = referralPage.map(referral -> referralMapper.toDto(referral, awsS3Service));

        return ResponseEntity.ok(ApiResponse.success(referralDtoPage));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<List<ReferralDto>>> getPendingReferrals(@AuthenticationPrincipal Account account) {
        log.info("Fetching pending referrals for doctor: {}", account.getId());

        List<Referral> referrals = referralService.findPendingReferralsForDoctor(account);
        List<ReferralDto> referralDtos = referrals.stream()
                .map(referral -> referralMapper.toDto(referral, awsS3Service))
                .toList();

        return ResponseEntity.ok(ApiResponse.success(referralDtos));
    }

    @PutMapping("/{referralId}/status")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<Void>> updateReferralStatus(
            @PathVariable UUID referralId,
            @Valid @RequestBody UpdateReferralStatusRequestDto request,
            @AuthenticationPrincipal Account account) {
        log.info("Updating referral status: {} to {}", referralId, request.status());

        referralService.updateReferralStatus(referralId, account, request);

        return ResponseEntity.ok(ApiResponse.success("Referral status updated successfully"));
    }

    @PostMapping("/{referralId}/schedule-appointment")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<Void>> scheduleAppointment(
            @PathVariable UUID referralId,
            @RequestParam UUID timeSlotId,
            @AuthenticationPrincipal Account account) {
        log.info("Scheduling appointment for referral: {} with time slot: {}", referralId, timeSlotId);

        referralService.scheduleAppointment(referralId, timeSlotId, account);

        return ResponseEntity.ok(ApiResponse.success("Appointment scheduled successfully"));
    }

    @GetMapping("/statistics")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<ReferralStatisticsDto>> getReferralStatistics(
            @AuthenticationPrincipal Account account) {
        log.info("Fetching referral statistics for doctor: {}", account.getId());

        ReferralStatisticsDto statistics = referralService.getReferralStatistics(account);

        return ResponseEntity.ok(ApiResponse.success(statistics));
    }
}
