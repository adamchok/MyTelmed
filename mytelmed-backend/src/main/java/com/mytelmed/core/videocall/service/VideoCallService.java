package com.mytelmed.core.videocall.service;

import com.mytelmed.common.advice.AppException;
import com.mytelmed.common.advice.exception.ResourceNotFoundException;
import com.mytelmed.common.constant.AccountType;
import com.mytelmed.common.constant.appointment.AppointmentStatus;
import com.mytelmed.common.dto.StreamTokenAndUserResponseDto;
import com.mytelmed.core.appointment.entity.Appointment;
import com.mytelmed.core.appointment.repository.AppointmentRepository;
import com.mytelmed.core.appointment.service.AppointmentService;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.videocall.entity.VideoCall;
import com.mytelmed.core.videocall.repository.VideoCallRepository;
import com.mytelmed.infrastructure.stream.service.StreamService;
import io.getstream.exceptions.StreamException;
import io.getstream.models.CallResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;


@Slf4j
@Service
public class VideoCallService {
    private final VideoCallRepository videoCallRepository;
    private final AppointmentService appointmentService;
    private final AppointmentRepository appointmentRepository;
    private final StreamService streamService;

    public VideoCallService(VideoCallRepository videoCallRepository,
                            AppointmentService appointmentService,
                            AppointmentRepository appointmentRepository,
                            StreamService streamService) {
        this.videoCallRepository = videoCallRepository;
        this.appointmentService = appointmentService;
        this.appointmentRepository = appointmentRepository;
        this.streamService = streamService;
    }

    @Transactional(readOnly = true)
    public VideoCall findById(UUID id) throws ResourceNotFoundException {
        log.debug("Finding video call by ID: {}", id);

        VideoCall videoCall = videoCallRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Video call not found for ID: {}", id);
                    return new ResourceNotFoundException("Video call not found");
                });

        log.debug("Found video call with id: {}", id);
        return videoCall;
    }

    @Transactional(readOnly = true)
    public VideoCall findByAppointmentId(UUID appointmentId) {
        log.debug("Finding video call by appointment ID: {}", appointmentId);

        VideoCall videoCall = videoCallRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> {
                    log.warn("Video call not found for appointment ID: {}", appointmentId);
                    return new ResourceNotFoundException("Video call not found");
                });

        log.debug("Found video call with appointment ID: {}", appointmentId);
        return videoCall;
    }

    @Transactional
    public VideoCall createStreamCallAndGetVideoCall(UUID appointmentId, Account account) throws AppException {
        log.debug("Creating video call for appointment: {}", appointmentId);

        // Find appointment
        Appointment appointment = appointmentService.findById(appointmentId);

        // Find video call
        VideoCall videoCall = findByAppointmentId(appointmentId);

        // Check if Stream call is created, if yes, then return video call
        if (videoCall.getIsActive()) {
            log.warn("Video call already exists for appointment: {}", appointmentId);
            return videoCall;
        }

        // Validate appointment status and timing
        validateAppointmentForVideoCall(appointment);

        try {
            // Create Stream call using the existing StreamService
            CallResponse callResponse = streamService.createCall(appointment, account.getId().toString());

            // Update vide call
            videoCall.setStreamCallId(callResponse.getId());
            videoCall.setStreamCallType(callResponse.getType());
            videoCall.setIsActive(true);

            // Save video call
            videoCallRepository.save(videoCall);

            // Update appointment status
            appointment.setStatus(AppointmentStatus.IN_PROGRESS);
            appointmentRepository.save(appointment);

            log.info("Successfully created video call for appointment: {} with Stream call ID: {}",
                    appointmentId, callResponse.getId());

            return videoCall;
        } catch (StreamException e) {
            log.error("Stream SDK error creating video call for appointment: {}", appointmentId, e);
            throw new AppException("Failed to create video call: " + e.getMessage());
        } catch (Exception e) {
            log.error("Failed to create video call for appointment: {}", appointmentId, e);
            throw new AppException("Failed to create video call: " + e.getMessage());
        }
    }

    @Transactional
    public StreamTokenAndUserResponseDto createVideoCallAndGetStreamUserAndToken(UUID appointmentId, Account account)
            throws AppException {
        log.debug("User with account ID {} is attempting to join video call for appointment: {}",
                account.getId(), appointmentId);

        // Find the appointment
        Appointment appointment = appointmentService.findById(appointmentId);

        // Validate authorization and timing
        validateUserCanJoinCall(appointment, account);
        validateCallTiming(appointment);

        // Determine if user is patient or provider
        boolean isPatient = isUserPatient(account);
        String streamUserId = isPatient ? appointment.getPatient().getId().toString() :
                appointment.getDoctor().getId().toString();
        String streamUserName = isPatient ? appointment.getPatient().getName() :
                appointment.getDoctor().getName();

        try {
            // Check if VideoCall exists; if not, create one
            VideoCall videoCall = videoCallRepository.findByAppointmentId(appointmentId).orElseGet(() -> {
                VideoCall newCall = VideoCall.builder()
                        .appointment(appointment)
                        .build();
                return videoCallRepository.save(newCall);
            });

            // Generate a new token using StreamService
            String token = streamService.createOrUpdateUserAndGenerateToken(streamUserId, streamUserName);

            // Update video call with a token
            if (isPatient) {
                videoCall.setPatientToken(token);
                if (videoCall.getPatientJoinedAt() == null) {
                    videoCall.setPatientJoinedAt(Instant.now());
                }
            } else {
                videoCall.setProviderToken(token);
                if (videoCall.getProviderJoinedAt() == null) {
                    videoCall.setProviderJoinedAt(Instant.now());
                }
            }

            // Start the meeting if this is the first participant to join
            if (videoCall.getMeetingStartedAt() == null) {
                videoCall.setMeetingStartedAt(Instant.now());
                appointment.setStatus(AppointmentStatus.IN_PROGRESS);
                appointmentRepository.save(appointment);
            }

            // Save updated video call
            videoCallRepository.save(videoCall);

            log.info("Successfully generated token for user with account ID: {} in call: {}",
                    account.getId(), videoCall.getStreamCallId());

            return StreamTokenAndUserResponseDto.builder()
                    .token(token)
                    .userId(streamUserId)
                    .name(streamUserName)
                    .build();
        } catch (StreamException e) {
            log.error("Stream SDK error joining video call for appointment: {} by user with account ID: {}",
                    appointmentId, account.getId(), e);
            throw new AppException("Failed to join video call");
        } catch (Exception e) {
            log.error("Failed to join video call for appointment: {} by user with account ID: {}",
                    appointmentId, account.getId(), e);
            throw new AppException("Failed to join video call");
        }
    }

    /**
     * Ends a video call
     */
    @Transactional
    public void endVideoCall(UUID appointmentId, Account account) throws AppException {
        log.debug("User {} attempting to end video call for appointment: {}", account.getId(), appointmentId);

        // Find the appointment
        Appointment appointment = appointmentService.findById(appointmentId);

        // Find video call
        VideoCall videoCall = findById(appointment.getVideoCall().getId());

        // Validate authorization
        validateUserCanJoinCall(appointment, account);

        try {
            // Determine if user is patient or provider
            boolean isPatient = isUserPatient(account);

            // Update leave time
            if (isPatient) {
                videoCall.setPatientLeftAt(Instant.now());
            } else {
                videoCall.setProviderLeftAt(Instant.now());
            }

            // If both participants have left end the meeting
            boolean shouldEndMeeting = videoCall.getPatientLeftAt() != null && videoCall.getProviderLeftAt() != null;

            if (shouldEndMeeting && videoCall.getMeetingEndedAt() == null) {
                // Update video call
                videoCall.setMeetingEndedAt(Instant.now());
                videoCall.setIsActive(false);

                // Complete the appointment
                appointment.setStatus(AppointmentStatus.COMPLETED);
                appointment.setCompletedAt(Instant.now());
                appointmentRepository.save(appointment);

                log.info("Successfully ended video call for appointment: {}", appointmentId);
            }

            // Save video call
            videoCallRepository.save(videoCall);
        } catch (Exception e) {
            log.error("Failed to end video call for appointment: {}", appointmentId, e);
            throw new AppException("Failed to end video call: " + e.getMessage());
        }
    }

    private void validateAppointmentForVideoCall(Appointment appointment) throws AppException {
        // Check appointment status
        if (!AppointmentStatus.READY_FOR_CALL.equals(appointment.getStatus())) {
            throw new AppException("Video call can only be created for confirmed appointments");
        }

        // Check timing - can only create a call 15 minutes before appointment
        LocalDateTime appointmentTime = appointment.getTimeSlot().getStartTime();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime earliestCallTime = appointmentTime.minusMinutes(15);

        if (now.isBefore(earliestCallTime)) {
            throw new AppException("Video call can only be started 15 minutes before the appointment time");
        }

        if (now.isAfter(appointmentTime.plusMinutes(appointment.getTimeSlot().getDurationMinutes()))) {
            throw new AppException("Appointment time has passed");
        }
    }

    private void validateUserCanJoinCall(Appointment appointment, Account account) throws AppException {
        switch (account.getPermission().getType()) {
            case PATIENT -> {
                if (!appointment.getPatient().getAccount().getId().equals(account.getId())) {
                    throw new AppException("You are not authorized to join this video call");
                }
            }
            case DOCTOR -> {
                if (!appointment.getDoctor().getAccount().getId().equals(account.getId())) {
                    throw new AppException("You are not authorized to join this video call");
                }
            }
            default -> throw new AppException("You are not authorized to join this video call");
        }
    }

    private void validateCallTiming(Appointment appointment) throws AppException {
        LocalDateTime appointmentTime = appointment.getTimeSlot().getStartTime();
        LocalDateTime appointmentEndTime = appointment.getTimeSlot().getEndTime();
        LocalDateTime now = LocalDateTime.now();

        // Can join 15 minutes before appointment
        LocalDateTime earliestJoinTime = appointmentTime.minusMinutes(15);

        if (now.isBefore(earliestJoinTime)) {
            throw new AppException("Video call can only be joined 15 minutes before the appointment time");
        }

        if (now.isAfter(appointmentEndTime)) {
            throw new AppException("Appointment time has ended");
        }
    }

    private boolean isUserPatient(Account account) {
        return account.getPermission().getType().equals(AccountType.PATIENT);
    }
}
