package com.mytelmed.core.transcription.controller;

import com.mytelmed.common.advice.AppException;
import com.mytelmed.common.dto.ApiResponse;
import com.mytelmed.core.appointment.entity.Appointment;
import com.mytelmed.core.appointment.service.AppointmentService;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.transcription.dto.TranscriptionSummaryDto;
import com.mytelmed.core.transcription.entity.TranscriptionSummary;
import com.mytelmed.core.transcription.mapper.TranscriptionSummaryMapper;
import com.mytelmed.core.transcription.service.TranscriptionService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.UUID;

/**
 * REST controller for transcription summary operations
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/transcription")
public class TranscriptionController {

    private final TranscriptionService transcriptionService;
    private final TranscriptionSummaryMapper mapper;
    private final AppointmentService appointmentService;

    public TranscriptionController(TranscriptionService transcriptionService,
            TranscriptionSummaryMapper mapper,
            AppointmentService appointmentService) {
        this.transcriptionService = transcriptionService;
        this.mapper = mapper;
        this.appointmentService = appointmentService;
    }

    @GetMapping("/appointment/{appointmentId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'PATIENT')")
    public ResponseEntity<ApiResponse<TranscriptionSummaryDto>> getTranscriptionSummary(
            @PathVariable UUID appointmentId,
            @AuthenticationPrincipal Account account) {
        log.debug("Getting transcription summary for appointment: {} by user: {}", appointmentId, account.getId());

        // Validate user has access to this appointment
        validateUserAccessToAppointment(appointmentId, account);

        Optional<TranscriptionSummary> summary = transcriptionService.getTranscriptionSummary(appointmentId);

        if (summary.isEmpty()) {
            return ResponseEntity.ok(ApiResponse.success(null, "No transcription summary found"));
        }

        TranscriptionSummaryDto summaryDto = mapper.toDto(summary.get());
        return ResponseEntity.ok(ApiResponse.success(summaryDto));
    }

    @GetMapping("/appointment/{appointmentId}/exists")
    @PreAuthorize("hasAnyRole('DOCTOR', 'PATIENT')")
    public ResponseEntity<ApiResponse<Boolean>> hasTranscriptionSummary(
            @PathVariable UUID appointmentId,
            @AuthenticationPrincipal Account account) {
        log.debug("Checking if transcription summary exists for appointment: {} by user: {}", appointmentId,
                account.getId());

        // Validate user has access to this appointment
        validateUserAccessToAppointment(appointmentId, account);

        boolean exists = transcriptionService.hasTranscriptionSummary(appointmentId);
        return ResponseEntity.ok(ApiResponse.success(exists));
    }

    @DeleteMapping("/appointment/{appointmentId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteTranscriptionSummary(
            @PathVariable UUID appointmentId,
            @AuthenticationPrincipal Account account) {
        log.info("Deleting transcription summary for appointment: {} by user: {}", appointmentId, account.getId());

        // Validate user has access to this appointment
        validateUserAccessToAppointment(appointmentId, account);

        transcriptionService.deleteTranscriptionSummary(appointmentId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    private void validateUserAccessToAppointment(UUID appointmentId, Account account) {
        try {
            Appointment appointment = appointmentService.findById(appointmentId);

            switch (account.getPermission().getType()) {
                case DOCTOR -> {
                    if (!appointment.getDoctor().getAccount().getId().equals(account.getId())) {
                        throw new AppException("Access denied: Not your appointment");
                    }
                }
                case PATIENT -> {
                    if (!appointment.getPatient().getAccount().getId().equals(account.getId())) {
                        throw new AppException("Access denied: Not your appointment");
                    }
                }
                case ADMIN -> {
                    // Admin can access any appointment
                }
                default -> throw new AppException("Access denied: Invalid user type");
            }
        } catch (Exception e) {
            log.error("Error validating user access to appointment: {}", appointmentId, e);
            throw new AppException("Access denied");
        }
    }
}