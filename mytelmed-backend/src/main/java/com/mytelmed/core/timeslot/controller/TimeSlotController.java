package com.mytelmed.core.timeslot.controller;

import com.mytelmed.common.dto.ApiResponse;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.timeslot.dto.CreateTimeSlotRequestDto;
import com.mytelmed.core.timeslot.dto.TimeSlotDto;
import com.mytelmed.core.timeslot.dto.UpdateTimeSlotRequestDto;
import com.mytelmed.core.timeslot.entity.TimeSlot;
import com.mytelmed.core.timeslot.mapper.TimeSlotMapper;
import com.mytelmed.core.timeslot.service.TimeSlotService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;


@Slf4j
@RestController
@RequestMapping("/api/v1/time-slots")
public class TimeSlotController {
    private final TimeSlotService timeSlotService;
    private final TimeSlotMapper timeSlotMapper;

    public TimeSlotController(TimeSlotService timeSlotService, TimeSlotMapper timeSlotMapper) {
        this.timeSlotService = timeSlotService;
        this.timeSlotMapper = timeSlotMapper;
    }

    @GetMapping("/{doctorId}/available")
    public ResponseEntity<ApiResponse<List<TimeSlotDto>>> getAvailableTimeSlots(
            @PathVariable UUID doctorId,
            @RequestParam LocalDateTime startDate,
            @RequestParam LocalDateTime endDate
    ) {
        log.info("Received request to get available time slots for doctor with ID: {} between dates: {} and {}",
                doctorId, startDate, endDate);

        List<TimeSlot> timeSlots = timeSlotService.findAvailableSlotsByDoctorId(doctorId, startDate, endDate);
        List<TimeSlotDto> timeSlotDtoList = timeSlots.stream()
                .map(timeSlotMapper::toDto)
                .toList();
        return ResponseEntity.ok(ApiResponse.success(timeSlotDtoList));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TimeSlotDto>>> getDoctorTimeSlots(
            @RequestParam(required = false) LocalDateTime fromDate,
            @AuthenticationPrincipal Account account
    ) {
        log.info("Received request to get time slots by doctor account {}", account.getId());

        LocalDateTime searchFromDate = fromDate != null ? fromDate : LocalDateTime.now();
        List<TimeSlot> timeSlots = timeSlotService.findByAccount(account, searchFromDate);
        List<TimeSlotDto> timeSlotDtoList = timeSlots.stream()
                .map(timeSlotMapper::toDto)
                .toList();
        return ResponseEntity.ok(ApiResponse.success(timeSlotDtoList));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Void>> createTimeSlot(
            @Valid @RequestBody CreateTimeSlotRequestDto request,
            @AuthenticationPrincipal Account account
    ) {
        log.info("Received request to create time slot for doctor account {}", account.getId());

        timeSlotService.create(account, request);
        return ResponseEntity.ok(ApiResponse.success("Time slot created successfully"));
    }

    @PatchMapping("/{timeSlotId}")
    public ResponseEntity<ApiResponse<Void>> updateTimeSlot(
            @PathVariable UUID timeSlotId,
            @Valid @RequestBody UpdateTimeSlotRequestDto request,
            @AuthenticationPrincipal Account account
    ) {
        log.info("Received request to update time slot with ID {}", timeSlotId);

        timeSlotService.update(account, timeSlotId, request);
        return ResponseEntity.ok(ApiResponse.success("Time slot updated successfully"));
    }

    @PatchMapping("/enable/{timeSlotId}")
    public ResponseEntity<ApiResponse<Void>> enableTimeSlot(
            @PathVariable UUID timeSlotId,
            @AuthenticationPrincipal Account account
    ) {
        log.info("Received request to enable time slot with ID {}", timeSlotId);

        timeSlotService.enableTimeSlotById(account, timeSlotId);
        return ResponseEntity.ok(ApiResponse.success("Time slot enabled successfully"));
    }

    @PatchMapping("/disable/{timeSlotId}")
    public ResponseEntity<ApiResponse<Void>> disableTimeSlot(
            @PathVariable UUID timeSlotId,
            @AuthenticationPrincipal Account account
    ) {
        log.info("Received request to disable time slot with ID {}", timeSlotId);
        
        timeSlotService.disableTimeSlotById(account, timeSlotId);
        return ResponseEntity.ok(ApiResponse.success("Time slot disabled successfully"));
    }
}
