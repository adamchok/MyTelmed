package com.mytelmed.common.event.videocall.listener;

import com.mytelmed.common.event.videocall.VideoCallEndedEvent;
import com.mytelmed.core.transcription.service.TranscriptionService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

/**
 * Event listener for video call events
 */
@Slf4j
@Component
public class VideoCallEventListener {

    private final TranscriptionService transcriptionService;

    public VideoCallEventListener(TranscriptionService transcriptionService) {
        this.transcriptionService = transcriptionService;
    }

    @Async
    @EventListener
    public void handleVideoCallEnded(VideoCallEndedEvent event) {
        log.info("Video call ended for appointment: {}, has transcription: {}",
                event.appointmentId(), event.hasTranscription());

        if (event.hasTranscription() && event.transcriptionText() != null
                && !event.transcriptionText().trim().isEmpty()) {
            log.info("Processing transcription for appointment: {}", event.appointmentId());
            transcriptionService.processTranscriptionAsync(event.appointmentId(), event.transcriptionText());
        } else {
            log.info("No transcription available for appointment: {}", event.appointmentId());
        }
    }
}