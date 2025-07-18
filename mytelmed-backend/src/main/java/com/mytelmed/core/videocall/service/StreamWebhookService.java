package com.mytelmed.core.videocall.service;

import com.mytelmed.common.constant.appointment.AppointmentStatus;
import com.mytelmed.common.event.videocall.VideoCallEndedEvent;
import com.mytelmed.core.appointment.entity.Appointment;
import com.mytelmed.core.appointment.repository.AppointmentRepository;
import com.mytelmed.core.transcription.service.StreamTranscriptionService;
import com.mytelmed.core.videocall.entity.VideoCall;
import com.mytelmed.core.videocall.repository.VideoCallRepository;
import com.mytelmed.infrastructure.stream.service.StreamService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;

/**
 * Service for processing Stream SDK webhook events.
 * Automatically manages appointment completion when all participants leave
 * video calls.
 */
@Slf4j
@Service
public class StreamWebhookService {
    private final VideoCallRepository videoCallRepository;
    private final AppointmentRepository appointmentRepository;
    private final StreamService streamService;
    private final ApplicationEventPublisher eventPublisher;
    private final StreamTranscriptionService streamTranscriptionService;

    public StreamWebhookService(VideoCallRepository videoCallRepository,
            AppointmentRepository appointmentRepository,
            StreamService streamService,
            ApplicationEventPublisher eventPublisher,
            StreamTranscriptionService streamTranscriptionService) {
        this.videoCallRepository = videoCallRepository;
        this.appointmentRepository = appointmentRepository;
        this.streamService = streamService;
        this.eventPublisher = eventPublisher;
        this.streamTranscriptionService = streamTranscriptionService;
    }

    /**
     * Processes incoming Stream webhook events
     */
    @Transactional
    public void processWebhookEvent(Map<String, Object> payload) {
        String eventType = (String) payload.get("type");

        if (eventType == null) {
            log.warn("Received webhook event without type");
            return;
        }

        log.debug("Processing Stream webhook event: {}", eventType);

        switch (eventType) {
            case "call.session_participant_left" -> handleParticipantLeft(payload);
            case "call.session_ended" -> handleCallEnded(payload);
            case "call.session_participant_joined" -> handleParticipantJoined(payload);
            case "call.transcription_ready" -> handleTranscriptionReady(payload);
            default -> log.debug("Ignoring webhook event type: {}", eventType);
        }
    }

    /**
     * Handles when a participant leaves the call
     */
    @Transactional
    protected void handleParticipantLeft(Map<String, Object> payload) {
        try {
            String callId = extractCallId(payload);
            if (callId == null) {
                log.warn("No call ID found in participant left event");
                return;
            }

            log.info("Participant left call: {}", callId);

            // Check if this call should be ended (no participants remaining)
            checkAndCompleteCallIfEmpty(callId);

        } catch (Exception e) {
            log.error("Error handling participant left event", e);
        }
    }

    /**
     * Handles when a call session ends
     */
    @Transactional
    protected void handleCallEnded(Map<String, Object> payload) {
        try {
            String callId = extractCallId(payload);
            if (callId == null) {
                log.warn("No call ID found in call ended event");
                return;
            }

            log.info("Call session ended: {}", callId);

            // Automatically complete the appointment
            completeAppointmentForCall(callId, "Call ended - all participants left");

        } catch (Exception e) {
            log.error("Error handling call ended event", e);
        }
    }

    /**
     * Handles when a participant joins the call (for logging/monitoring)
     */
    @Transactional
    protected void handleParticipantJoined(Map<String, Object> payload) {
        try {
            log.info("Participant joined event payload: {}", payload);

            String callId = extractCallId(payload);
            Map<String, Object> user = (Map<String, Object>) payload.get("user");
            String userName = user != null ? (String) user.get("name") : "Unknown";

            log.info("Participant {} joined call: {}", userName, callId);

        } catch (Exception e) {
            log.error("Error handling participant joined event", e);
        }
    }

    /**
     * Handles when transcription is ready from GetStream
     */
    @Transactional
    protected void handleTranscriptionReady(Map<String, Object> payload) {
        try {
            log.info("Processing transcription ready event");

            String callId = extractCallId(payload);
            if (callId == null) {
                log.warn("No call ID found in transcription ready event");
                return;
            }

            // Extract transcription data from payload
            Map<String, Object> callTranscription = (Map<String, Object>) payload.get("call_transcription");
            if (callTranscription == null) {
                log.warn("No call_transcription found in payload for call: {}", callId);
                return;
            }

            String transcriptionUrl = (String) callTranscription.get("url");
            if (transcriptionUrl == null || transcriptionUrl.trim().isEmpty()) {
                log.warn("No transcription URL found for call: {}", callId);
                return;
            }

            // Find the video call and appointment
            Optional<VideoCall> videoCallOpt = videoCallRepository.findByStreamCallId(callId);
            if (videoCallOpt.isEmpty()) {
                log.warn("No video call found for Stream call ID: {}", callId);
                return;
            }

            VideoCall videoCall = videoCallOpt.get();
            Appointment appointment = videoCall.getAppointment();

            log.info("Processing transcription for appointment: {} from URL: {}",
                    appointment.getId(), transcriptionUrl);

            // Download and process the transcription asynchronously
            // We'll process this in a separate thread to avoid blocking the webhook
            // response
            String finalTranscriptionUrl = transcriptionUrl;

            // Process transcription in a separate thread to avoid blocking webhook response
            new Thread(() -> {
                try {
                    String doctorId = appointment.getDoctor().getId().toString();
                    String patientId = appointment.getPatient().getId().toString();

                    String transcriptionText = streamTranscriptionService
                            .downloadAndProcessTranscription(finalTranscriptionUrl, doctorId, patientId);

                    if (transcriptionText != null && !transcriptionText.trim().isEmpty()) {
                        // Fire transcription event for AI processing

                        log.info("Formatted transcript: {}", transcriptionText);

                        fireVideoCallTranscriptionEvent(appointment, videoCall, transcriptionText);
                        log.info("Successfully processed transcription for appointment: {}", appointment.getId());
                    } else {
                        log.warn("Failed to process transcription or transcription is empty for appointment: {}",
                                appointment.getId());
                    }
                } catch (Exception e) {
                    log.error("Error processing transcription for appointment: {}", appointment.getId(), e);
                }
            }).start();
        } catch (Exception e) {
            log.error("Error handling transcription ready event", e);
        }
    }

    /**
     * Checks if a call has no participants and completes the appointment if so
     */
    @Transactional
    protected void checkAndCompleteCallIfEmpty(String streamCallId) {
        try {
            int participantCount = streamService.getCallParticipantCount(streamCallId);

            log.debug("Call {} has {} participants remaining", streamCallId, participantCount);

            if (participantCount == 0) {
                log.info("No participants remaining in call {}, completing appointment", streamCallId);
                completeAppointmentForCall(streamCallId, "Automatically completed - all participants left");
            }
        } catch (Exception e) {
            log.error("Error checking participant count for call: {}", streamCallId, e);
        }
    }

    /**
     * Completes the appointment associated with a Stream call
     */
    @Transactional
    protected void completeAppointmentForCall(String streamCallId, String reason) {
        try {
            // Find the video call by Stream call ID
            Optional<VideoCall> videoCallOpt = videoCallRepository.findByStreamCallId(streamCallId);

            if (videoCallOpt.isEmpty()) {
                log.warn("No video call found for Stream call ID: {}", streamCallId);
                return;
            }

            VideoCall videoCall = videoCallOpt.get();
            Appointment appointment = videoCall.getAppointment();

            // Only complete if appointment is currently in progress
            if (appointment.getStatus() != AppointmentStatus.IN_PROGRESS) {
                log.debug("Appointment {} is not in progress (status: {}), skipping completion",
                        appointment.getId(), appointment.getStatus());
                return;
            }

            // Complete the video call
            videoCall.setMeetingEndedAt(Instant.now());
            videoCall.setIsActive(false);
            if (videoCall.getPatientLeftAt() == null) {
                videoCall.setPatientLeftAt(Instant.now());
            }
            if (videoCall.getProviderLeftAt() == null) {
                videoCall.setProviderLeftAt(Instant.now());
            }
            videoCallRepository.save(videoCall);

            // Complete the appointment
            appointment.setStatus(AppointmentStatus.COMPLETED);
            appointment.setCompletedAt(Instant.now());
            appointment.setDoctorNotes(
                    appointment.getDoctorNotes() != null ? appointment.getDoctorNotes() + "\n\n" + reason : reason);
            appointmentRepository.save(appointment);

            log.info("Successfully completed appointment {} for call {}: {}",
                    appointment.getId(), streamCallId, reason);

            // Fire event for transcription processing
            // fireVideoCallEndedEvent(appointment, videoCall);

        } catch (Exception e) {
            log.error("Error completing appointment for call {}: {}", streamCallId, e.getMessage(), e);
        }
    }

    /**
     * Extracts the call ID from a webhook payload
     */
    private String extractCallId(Map<String, Object> payload) {
        try {
            log.debug("Extracting call ID from webhook payload: {}", payload);
            String call = (String) payload.get("call_cid");
            log.debug("Extracted call ID: {}", call);
            if (call != null) {
                String callId = call.split(":")[1];
                log.debug("Extracted call ID is a Stream call ID: {}", callId);
                return callId;
            }

            return null;
        } catch (Exception e) {
            log.error("Error extracting call ID from webhook payload", e);
            return null;
        }
    }

    /**
     * Fire event for transcription processing with real transcription data
     */
    private void fireVideoCallTranscriptionEvent(Appointment appointment, VideoCall videoCall,
            String transcriptionText) {
        try {
            boolean hasTranscription = transcriptionText != null && !transcriptionText.trim().isEmpty();
            String callDuration = calculateCallDuration(videoCall);

            VideoCallEndedEvent event = new VideoCallEndedEvent(
                    appointment.getId(),
                    transcriptionText,
                    callDuration,
                    hasTranscription);

            eventPublisher.publishEvent(event);
            log.info("Published VideoCallEndedEvent with real transcription for appointment: {}", appointment.getId());

        } catch (Exception e) {
            log.error("Error publishing VideoCallEndedEvent for appointment: {}", appointment.getId(), e);
        }
    }

    /**
     * Calculate call duration
     */
    private String calculateCallDuration(VideoCall videoCall) {
        if (videoCall.getMeetingStartedAt() != null && videoCall.getMeetingEndedAt() != null) {
            long durationSeconds = videoCall.getMeetingEndedAt().getEpochSecond() -
                    videoCall.getMeetingStartedAt().getEpochSecond();
            long minutes = durationSeconds / 60;
            long seconds = durationSeconds % 60;
            return String.format("%d:%02d", minutes, seconds);
        }
        return "Unknown";
    }
}
