package com.mytelmed.core.appointment.controller;

import com.mytelmed.common.dto.ApiResponse;
import com.mytelmed.core.appointment.dto.AppointmentDto;
import com.mytelmed.core.appointment.dto.BookAppointmentRequestDto;
import com.mytelmed.core.appointment.dto.UpdateAppointmentRequestDto;
import com.mytelmed.core.appointment.entity.Appointment;
import com.mytelmed.core.appointment.mapper.AppointmentMapper;
import com.mytelmed.core.appointment.service.AppointmentService;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.infrastructure.aws.service.AwsS3Service;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.util.UUID;

/**
 * Controller for managing appointments in Malaysian public healthcare
 * telemedicine.
 * Supports both PHYSICAL and VIRTUAL appointment types with proper lifecycle
 * management.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/appointment")
public class AppointmentController {
        private final AppointmentService appointmentService;
        private final AppointmentMapper appointmentMapper;
        private final AwsS3Service awsS3Service;

        public AppointmentController(AppointmentService appointmentService, AppointmentMapper appointmentMapper,
                        AwsS3Service awsS3Service) {
                this.appointmentService = appointmentService;
                this.appointmentMapper = appointmentMapper;
                this.awsS3Service = awsS3Service;
        }

        @GetMapping("/{appointmentId}")
        public ResponseEntity<ApiResponse<AppointmentDto>> getAppointmentById(@PathVariable UUID appointmentId) {
                log.info("Received request to get appointment with ID: {}", appointmentId);

                Appointment appointment = appointmentService.findById(appointmentId);
                AppointmentDto appointmentDto = appointmentMapper.toDto(appointment, awsS3Service);
                return ResponseEntity.ok(ApiResponse.success(appointmentDto));
        }

        @GetMapping
        public ResponseEntity<ApiResponse<Page<AppointmentDto>>> getAppointmentsByAccount(
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "10", required = false) int pageSize,
                        @AuthenticationPrincipal Account account) {
                log.info("Received request to get appointments for account with ID {}, page {}, pageSize {}",
                                account.getId(), page, pageSize);

                Page<Appointment> appointmentPage = appointmentService.findByAccount(account, page,
                                pageSize);
                Page<AppointmentDto> appointmentDtoPage = appointmentPage
                                .map((appointment) -> appointmentMapper.toDto(appointment, awsS3Service));
                return ResponseEntity.ok(ApiResponse.success(appointmentDtoPage));
        }

        @GetMapping("/list")
        public ResponseEntity<ApiResponse<List<AppointmentDto>>> getAllAppointmentsByAccount(
                        @AuthenticationPrincipal Account account) {
                log.info("Received request to get all appointments for account with ID: {}", account.getId());

                List<Appointment> appointmentList = appointmentService.findByAllAccount(account);
                List<AppointmentDto> appointmentDtoList = appointmentList.stream()
                                .map((appointment) -> appointmentMapper.toDto(appointment, awsS3Service))
                                .toList();
                return ResponseEntity.ok(ApiResponse.success(appointmentDtoList));
        }

        @PostMapping
        public ResponseEntity<ApiResponse<Void>> bookAppointment(
                        @Valid @RequestBody BookAppointmentRequestDto request,
                        @AuthenticationPrincipal Account account) {
                log.info("Received request to book {} appointment for account with ID: {}",
                                request.consultationMode(), account.getId());

                appointmentService.book(account, request);
                return ResponseEntity.status(HttpStatus.CREATED)
                                .body(ApiResponse.success(
                                                request.consultationMode() + " appointment booked successfully"));
        }

        @PatchMapping("/{appointmentId}")
        public ResponseEntity<ApiResponse<Void>> updateAppointmentDetails(
                        @PathVariable UUID appointmentId,
                        @Valid @RequestBody UpdateAppointmentRequestDto request,
                        @AuthenticationPrincipal Account account) {
                log.info("Received request to update appointment details with ID: {}", appointmentId);

                appointmentService.updateAppointmentDetails(account, appointmentId, request);
                return ResponseEntity.ok(ApiResponse.success("Appointment details updated successfully"));
        }

        @PostMapping("/cancel/{appointmentId}")
        public ResponseEntity<ApiResponse<Void>> cancelAppointment(
                        @PathVariable UUID appointmentId,
                        @RequestBody(required = false) String reason,
                        @AuthenticationPrincipal Account account) {
                log.info("Received request to cancel appointment with ID: {}", appointmentId);

                appointmentService.cancelAppointment(account, appointmentId, reason);
                return ResponseEntity.ok(ApiResponse.success("Appointment cancelled successfully"));
        }

        @PutMapping("/start-virtual/{appointmentId}")
        public ResponseEntity<ApiResponse<Void>> startVirtualAppointment(
                        @PathVariable UUID appointmentId,
                        @AuthenticationPrincipal Account account) {
                log.info("Received request to start virtual appointment with ID: {} by account: {}",
                                appointmentId, account.getId());

                appointmentService.startVirtualAppointment(appointmentId, account);
                return ResponseEntity.ok(ApiResponse.success("Virtual appointment started successfully"));
        }

        @PutMapping("/complete/{appointmentId}")
        public ResponseEntity<ApiResponse<Void>> completeAppointment(
                        @PathVariable UUID appointmentId,
                        @RequestParam(required = false) @Size(max = 2000, message = "Doctor notes cannot exceed 2000 characters") String doctorNotes,
                        @AuthenticationPrincipal Account account) {
                log.info("Received request to complete appointment with ID: {} by doctor: {}",
                                appointmentId, account.getId());

                appointmentService.completeAppointment(appointmentId, account, doctorNotes);
                return ResponseEntity.ok(ApiResponse.success("Appointment completed successfully"));
        }
}
