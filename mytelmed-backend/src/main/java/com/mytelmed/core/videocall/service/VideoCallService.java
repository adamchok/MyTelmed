package com.mytelmed.core.videocall.service;

import com.mytelmed.common.advice.AppException;
import com.mytelmed.common.advice.exception.ResourceNotFoundException;
import com.mytelmed.common.constant.appointment.AppointmentStatus;
import com.mytelmed.common.constant.family.FamilyPermissionType;
import com.mytelmed.common.dto.StreamTokenAndUserResponseDto;
import com.mytelmed.core.appointment.entity.Appointment;
import com.mytelmed.core.appointment.repository.AppointmentRepository;
import com.mytelmed.core.appointment.service.AppointmentService;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.family.service.FamilyMemberPermissionService;
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

/**
 * Service for managing video calls in Malaysian public healthcare telemedicine.
 * Only supports VIRTUAL appointments - PHYSICAL appointments do not use video
 * calls.
 * <p>
 * Features automatic appointment completion when all participants leave the
 * call via:
 * 1. Stream webhook events (primary method)
 * 2. Stream API participant count check (fallback method)
 * 3. Manual endVideoCall method (legacy method)
 */
@Slf4j
@Service
public class VideoCallService {
    private final VideoCallRepository videoCallRepository;
    private final AppointmentService appointmentService;
    private final AppointmentRepository appointmentRepository;
    private final StreamService streamService;
    private final FamilyMemberPermissionService familyPermissionService;

    public VideoCallService(VideoCallRepository videoCallRepository,
            AppointmentService appointmentService,
            AppointmentRepository appointmentRepository,
            StreamService streamService,
            FamilyMemberPermissionService familyPermissionService) {
        this.videoCallRepository = videoCallRepository;
        this.appointmentService = appointmentService;
        this.appointmentRepository = appointmentRepository;
        this.streamService = streamService;
        this.familyPermissionService = familyPermissionService;
    }

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
        log.debug("Getting video call for appointment: {}", appointmentId);

        // Find appointment
        Appointment appointment = appointmentService.findById(appointmentId);

        // Validate that this is a virtual appointment
        if (!appointment.isVirtualConsultation()) {
            throw new AppException("Video calls are only available for VIRTUAL appointments. This is a " +
                    appointment.getConsultationMode() + " appointment.");
        }

        // Validate user has permission to access the call
        validateUserCanCreateCall(appointment, account);

        // Find video call
        VideoCall videoCall = findByAppointmentId(appointmentId);

        // Check if Stream call is already created (should be from appointment booking)
        if (videoCall.getIsActive() && videoCall.getStreamCallId() != null) {
            log.info("Found existing video call for appointment: {} with Stream call ID: {}",
                    appointmentId, videoCall.getStreamCallId());

            // Update appointment status to IN_PROGRESS if not already
            if (appointment.getStatus() != AppointmentStatus.IN_PROGRESS) {
                appointment.setStatus(AppointmentStatus.IN_PROGRESS);
                appointmentRepository.save(appointment);
                log.info("Updated appointment status to IN_PROGRESS for appointment: {}", appointmentId);
            }

            return videoCall;
        }

        // Fallback: Create Stream call if not created during booking (legacy support)
        log.warn("Video call not properly initialized during booking for appointment: {}. Creating now...",
                appointmentId);

        try {
            // Create Stream call using the existing StreamService
            CallResponse callResponse = streamService.createCall(appointment, account.getId().toString());

            // Update video call
            videoCall.setStreamCallId(callResponse.getId());
            videoCall.setStreamCallType(callResponse.getType());
            videoCall.setIsActive(true);

            // Save video call
            videoCallRepository.save(videoCall);

            // Update appointment status
            appointment.setStatus(AppointmentStatus.IN_PROGRESS);
            appointmentRepository.save(appointment);

            log.info("Created fallback Stream call for virtual appointment: {} with Stream call ID: {}",
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

        // Validate that this is a virtual appointment
        if (!appointment.isVirtualConsultation()) {
            throw new AppException("Video calls are only available for VIRTUAL appointments. This is a " +
                    appointment.getConsultationMode() + " appointment.");
        }

        // Validate authorization and timing
        validateUserCanJoinCall(appointment, account);

        // TODO: Undo for production
        // validateCallTiming(appointment);

        // Determine user role and get appropriate info
        UserCallInfo userCallInfo = getUserCallInfo(appointment, account);

        try {
            // Get VideoCall (should already exist from appointment booking)
            VideoCall videoCall = videoCallRepository.findByAppointmentId(appointmentId).orElseGet(() -> {
                log.warn("VideoCall not found for appointment {}. Creating fallback placeholder...", appointmentId);
                VideoCall newCall = VideoCall.builder()
                        .appointment(appointment)
                        .isActive(false)
                        .build();
                return videoCallRepository.save(newCall);
            });

            // Generate a new token using StreamService
            String token = streamService.createOrUpdateUserAndGenerateToken(userCallInfo.userId, userCallInfo.userName);

            // Update video call with a token
            if (userCallInfo.isPatient) {
                if (userCallInfo.isPrimaryPatient) {
                    // Primary patient joining
                    videoCall.setPatientToken(token);
                    if (videoCall.getPatientJoinedAt() == null) {
                        videoCall.setPatientJoinedAt(Instant.now());
                        log.info("Primary patient joined video call for appointment: {}", appointmentId);
                    }
                } else {
                    // Family member joining - they get the patient token but don't update join time
                    // unless it's the first patient-side participant
                    if (videoCall.getPatientJoinedAt() == null) {
                        videoCall.setPatientJoinedAt(Instant.now());
                        log.info("Family member {} joined video call for appointment: {}",
                                userCallInfo.userName, appointmentId);
                    } else {
                        log.info("Additional family member {} joined video call for appointment: {}",
                                userCallInfo.userName, appointmentId);
                    }
                }
            } else {
                videoCall.setProviderToken(token);
                if (videoCall.getProviderJoinedAt() == null) {
                    videoCall.setProviderJoinedAt(Instant.now());
                    log.info("Provider joined video call for appointment: {}", appointmentId);
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

            log.info("Successfully generated token for user with account ID: {} in virtual appointment call: {}",
                    account.getId(), videoCall.getStreamCallId());

            return StreamTokenAndUserResponseDto.builder()
                    .token(token)
                    .userId(userCallInfo.userId)
                    .name(userCallInfo.userName)
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
     * Ends a video call for virtual appointments
     */
    @Transactional
    public void endVideoCall(UUID appointmentId, Account account) throws AppException {
        log.debug("User {} attempting to end video call for appointment: {}", account.getId(), appointmentId);

        // Find the appointment
        Appointment appointment = appointmentService.findById(appointmentId);

        // Validate that this is a virtual appointment
        if (!appointment.isVirtualConsultation()) {
            throw new AppException("Video calls are only available for VIRTUAL appointments. This is a " +
                    appointment.getConsultationMode() + " appointment.");
        }

        // Find video call
        VideoCall videoCall = findById(appointment.getVideoCall().getId());

        // Validate authorization
        validateUserCanJoinCall(appointment, account);

        try {
            // Determine user role
            UserCallInfo userCallInfo = getUserCallInfo(appointment, account);

            // Update leave time based on participant type
            if (userCallInfo.isPatient) {
                if (userCallInfo.isPrimaryPatient) {
                    videoCall.setPatientLeftAt(Instant.now());
                    log.info("Primary patient left video call for appointment: {}", appointmentId);
                } else {
                    // Family member leaving - don't update patientLeftAt yet
                    log.info("Family member {} left video call for appointment: {}",
                            userCallInfo.userName, appointmentId);
                }
            } else {
                videoCall.setProviderLeftAt(Instant.now());
                log.info("Provider left video call for appointment: {}", appointmentId);
            }

            // // Determine if meeting should end
            // boolean shouldEndMeeting = shouldEndMeeting(videoCall, appointment,
            // userCallInfo);
            //
            // if (shouldEndMeeting && videoCall.getMeetingEndedAt() == null) {
            // // Update video call
            // videoCall.setMeetingEndedAt(Instant.now());
            // videoCall.setIsActive(false);
            //
            // // Complete the appointment
            // appointment.setStatus(AppointmentStatus.COMPLETED);
            // appointment.setCompletedAt(Instant.now());
            // appointmentRepository.save(appointment);
            //
            // log.info("Successfully ended video call for virtual appointment: {}",
            // appointmentId);
            // } else if (!shouldEndMeeting) {
            // // As a fallback, check with Stream API if all participants have actually
            // left
            // // This helps catch cases where webhook events might be missed
            // checkStreamCallParticipantsAndCompleteIfEmpty(videoCall, appointment);
            // }

            // Save video call
            videoCallRepository.save(videoCall);
        } catch (Exception e) {
            log.error("Failed to end video call for appointment: {}", appointmentId, e);
            throw new AppException("Failed to end video call: " + e.getMessage());
        }
    }

    /**
     * Manually checks if a video call has no participants and completes the
     * appointment if so.
     * This is useful for testing or manual intervention when webhooks might not be
     * working.
     *
     * @param appointmentId The appointment ID to check
     * @return true if the appointment was completed, false otherwise
     */
    @Transactional
    public boolean checkAndCompleteIfNoParticipants(UUID appointmentId) {
        try {
            Appointment appointment = appointmentService.findById(appointmentId);

            if (!appointment.isVirtualConsultation()) {
                log.debug("Appointment {} is not virtual, skipping participant check", appointmentId);
                return false;
            }

            if (appointment.getStatus() != AppointmentStatus.IN_PROGRESS) {
                log.debug("Appointment {} is not in progress, skipping participant check", appointmentId);
                return false;
            }

            VideoCall videoCall = findByAppointmentId(appointmentId);

            if (videoCall.getStreamCallId() == null) {
                log.debug("No Stream call ID for appointment {}, skipping participant check", appointmentId);
                return false;
            }

            int participantCount = streamService.getCallParticipantCount(videoCall.getStreamCallId());

            if (participantCount == 0) {
                log.info("Manual check found no participants in call for appointment {}, completing", appointmentId);
                checkStreamCallParticipantsAndCompleteIfEmpty(videoCall, appointment);
                return true;
            } else {
                log.debug("Manual check found {} participants still in call for appointment {}", participantCount,
                        appointmentId);
                return false;
            }
        } catch (Exception e) {
            log.error("Error during manual participant check for appointment {}: {}", appointmentId, e.getMessage());
            return false;
        }
    }

    private void validateAppointmentForVideoCall(Appointment appointment) throws AppException {
        // Check if appointment is virtual
        if (!appointment.isVirtualConsultation()) {
            throw new AppException("Video calls are only available for VIRTUAL appointments");
        }

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
        // First validate that this is a virtual appointment
        if (!appointment.isVirtualConsultation()) {
            throw new AppException("Video calls are only available for VIRTUAL appointments");
        }

        switch (account.getPermission().getType()) {
            case PATIENT -> {
                // Check if account is the patient themselves or a family member with
                // JOIN_VIDEO_CALL permission
                if (appointment.getPatient().getAccount().getId().equals(account.getId())) {
                    // Patient themselves - always allowed
                    return;
                }

                // Check if account is a family member with video call permission
                // (MANAGE_APPOINTMENTS)
                if (!familyPermissionService.hasPermission(account, appointment.getPatient().getId(),
                        FamilyPermissionType.MANAGE_APPOINTMENTS)) {
                    throw new AppException(
                            "You are not authorized to join this video call. You need appointment management permissions.");
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

    private void validateUserCanCreateCall(Appointment appointment, Account account) throws AppException {
        log.debug("Validating if account {} can create video call for appointment {}", account.getId(),
                appointment.getId());

        switch (account.getPermission().getType()) {
            case PATIENT -> {
                // Patient themselves can always create calls for their appointments
                if (appointment.getPatient().getAccount().getId().equals(account.getId())) {
                    return;
                }

                // Family members need MANAGE_APPOINTMENTS permission to create calls
                if (!familyPermissionService.hasPermission(account, appointment.getPatient().getId(),
                        FamilyPermissionType.MANAGE_APPOINTMENTS)) {
                    throw new AppException(
                            "You don't have permission to start this video call. Contact the patient or request appointment management permissions.");
                }
            }
            case DOCTOR -> {
                if (!appointment.getDoctor().getAccount().getId().equals(account.getId())) {
                    throw new AppException("You are not the assigned doctor for this appointment");
                }
            }
            default -> throw new AppException("You are not authorized to start this video call");
        }

        log.debug("Account {} is authorized to create video call for appointment {}", account.getId(),
                appointment.getId());
    }

    /**
     * Determines if the video call meeting should end based on who has left.
     * Meeting ends ONLY when BOTH primary patient and doctor have left.
     * Family members leaving does not affect this decision.
     */
    private boolean shouldEndMeeting(VideoCall videoCall, Appointment appointment, UserCallInfo leavingUser) {
        // Check if primary patient has left (either previously or leaving now)
        boolean primaryPatientLeft = videoCall.getPatientLeftAt() != null ||
                (leavingUser.isPatient && leavingUser.isPrimaryPatient);

        // Check if provider has left (either previously or leaving now)
        boolean providerLeft = videoCall.getProviderLeftAt() != null ||
                (!leavingUser.isPatient);

        // Call ends only when BOTH primary patient and doctor have left
        return primaryPatientLeft && providerLeft;
    }

    /**
     * Fallback method to check Stream API for actual participant count
     * and complete appointment if no participants remain.
     * This serves as a backup to webhook-based completion.
     */
    private void checkStreamCallParticipantsAndCompleteIfEmpty(VideoCall videoCall, Appointment appointment) {
        try {
            if (videoCall.getStreamCallId() == null) {
                log.debug("No Stream call ID available for video call: {}", videoCall.getId());
                return;
            }

            int participantCount = streamService.getCallParticipantCount(videoCall.getStreamCallId());

            if (participantCount == 0 && videoCall.getMeetingEndedAt() == null) {
                log.info("Stream API confirms no participants in call {}, completing appointment {}",
                        videoCall.getStreamCallId(), appointment.getId());

                // Complete the video call
                videoCall.setMeetingEndedAt(Instant.now());
                videoCall.setIsActive(false);
                videoCall.setPatientLeftAt(Instant.now());
                videoCall.setProviderLeftAt(Instant.now());
                videoCallRepository.save(videoCall);

                // Complete the appointment
                appointment.setStatus(AppointmentStatus.COMPLETED);
                appointment.setCompletedAt(Instant.now());
                String completionNote = "Automatically completed - Stream API confirmed all participants left";
                appointment.setDoctorNotes(
                        appointment.getDoctorNotes() != null ? appointment.getDoctorNotes() + "\n\n" + completionNote
                                : completionNote);
                appointmentRepository.save(appointment);

                log.info("Successfully auto-completed appointment {} via Stream API fallback", appointment.getId());
            }

        } catch (Exception e) {
            log.warn("Failed to check Stream participant count for fallback completion: {}", e.getMessage());
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

    private UserCallInfo getUserCallInfo(Appointment appointment, Account account) throws AppException {
        switch (account.getPermission().getType()) {
            case PATIENT -> {
                if (appointment.getPatient().getAccount().getId().equals(account.getId())) {
                    // Account is the patient themselves
                    return new UserCallInfo(
                            appointment.getPatient().getId().toString(),
                            appointment.getPatient().getName(),
                            true,
                            true); // isPrimaryPatient = true
                } else {
                    // Account is a family member - find their family member record
                    return appointment.getPatient().getFamilyMemberList()
                            .stream()
                            .filter(fm -> !fm.isPending() &&
                                    fm.getMemberAccount() != null &&
                                    fm.getMemberAccount().getId().equals(account.getId()))
                            .findFirst()
                            .map(familyMember -> new UserCallInfo(
                                    account.getId().toString(), // Use account ID as unique identifier
                                    familyMember.getName() + " (Family)",
                                    true, // Still on patient side
                                    false)) // isPrimaryPatient = false
                            .orElseThrow(() -> new AppException(
                                    "Family member not found or not authorized for this appointment"));
                }
            }
            case DOCTOR -> {
                return new UserCallInfo(
                        appointment.getDoctor().getId().toString(),
                        appointment.getDoctor().getName(),
                        false,
                        false); // isPrimaryPatient = false (doctor)
            }
            default -> throw new AppException("Invalid account type for video call");
        }
    }

    private static class UserCallInfo {
        final String userId;
        final String userName;
        final boolean isPatient;
        final boolean isPrimaryPatient;

        UserCallInfo(String userId, String userName, boolean isPatient, boolean isPrimaryPatient) {
            this.userId = userId;
            this.userName = userName;
            this.isPatient = isPatient;
            this.isPrimaryPatient = isPrimaryPatient;
        }
    }
}
