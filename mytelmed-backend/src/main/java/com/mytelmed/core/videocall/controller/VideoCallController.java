package com.mytelmed.core.videocall.controller;

import com.mytelmed.common.dto.ApiResponse;
import com.mytelmed.common.dto.StreamTokenAndUserResponseDto;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.videocall.dto.VideoCallDto;
import com.mytelmed.core.videocall.entity.VideoCall;
import com.mytelmed.core.videocall.mapper.VideoCallMapper;
import com.mytelmed.core.videocall.service.VideoCallService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.UUID;


@Slf4j
@RestController
@RequestMapping("/api/v1/video")
public class VideoCallController {
    private final VideoCallService videoCallService;
    private final VideoCallMapper videoCallMapper;

    public VideoCallController(VideoCallService videoCallService, VideoCallMapper videoCallMapper) {
        this.videoCallService = videoCallService;
        this.videoCallMapper = videoCallMapper;
    }

    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<ApiResponse<VideoCallDto>> getVideoCallByAppointmentId(
            @PathVariable UUID appointmentId,
            @AuthenticationPrincipal Account account
    ) {
        log.debug("Getting video call info for appointment: {} by user: {}", appointmentId, account.getId());

        VideoCall videoCall = videoCallService.findByAppointmentId(appointmentId);

        VideoCallDto videoCallDto = videoCallMapper.toDto(videoCall);
        return ResponseEntity.ok(ApiResponse.success(videoCallDto));
    }

    @PostMapping("/stream/call")
    public ResponseEntity<ApiResponse<VideoCallDto>> createStreamCallAndGetVideoCall(
            @Valid @NotNull(message = "Appointment ID is required") @RequestBody UUID appointmentId,
            @AuthenticationPrincipal Account account
    ) {
        log.info("Received request to create video call for appointment: {} by user: {}",
                appointmentId, account.getId());
        VideoCall videoCall = videoCallService.createStreamCallAndGetVideoCall(appointmentId, account);
        VideoCallDto videoCallDto = videoCallMapper.toDto(videoCall);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(videoCallDto));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<StreamTokenAndUserResponseDto>> createVideoCallAndGetStreamUserAndToken(
            @Valid @NotNull(message = "Appointment ID is required") @RequestBody UUID appointmentId,
            @AuthenticationPrincipal Account account
    ) {
        log.info("User {} joining video call for appointment: {}", account.getId(), appointmentId);

        StreamTokenAndUserResponseDto response = videoCallService
                .createVideoCallAndGetStreamUserAndToken(appointmentId, account);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/end/{appointmentId}")
    public ResponseEntity<ApiResponse<Void>> endVideoCall(
            @PathVariable String appointmentId,
            @AuthenticationPrincipal Account account
    ) {
        log.info("User {} ending video call for appointment: {}", account.getId(), appointmentId);

        videoCallService.endVideoCall(UUID.fromString(appointmentId), account);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
