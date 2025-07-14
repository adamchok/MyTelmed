package com.mytelmed.core.videocall.controller;

import com.mytelmed.core.videocall.service.StreamWebhookService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;


/**
 * Controller for handling Stream SDK webhooks for video call events.
 * Stream will send notifications when participants join/leave calls,
 * allowing us to automatically manage appointment completion.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/webhook/stream")
public class StreamWebhookController {
    private final String streamApiKey;
    private final StreamWebhookService streamWebhookService;

    public StreamWebhookController(StreamWebhookService streamWebhookService,
                                   @Value("${stream.api.key}") String streamApiKey) {
        this.streamWebhookService = streamWebhookService;
        this.streamApiKey = streamApiKey;
    }

    /**
     * Handles all Stream webhook events
     * Stream sends various events like:
     * - call.session_participant_joined
     * - call.session_participant_left
     * - call.session_ended
     */
    @PostMapping
    public ResponseEntity<String> handleStreamWebhook(
            @RequestBody Map<String, Object> payload,
            @RequestHeader(value = "X-API-KEY", required = false) String signature) {

        try {
            log.debug("Received Stream webhook event: {}", payload.get("type"));

            if (!signature.equals(this.streamApiKey)) {
                log.warn("Signature mismatch: {}", signature);
                return ResponseEntity.ok("Unable to process event due to invalid signature");
            }

            streamWebhookService.processWebhookEvent(payload);

            return ResponseEntity.ok("Event processed successfully");
        } catch (Exception e) {
            log.error("Error processing Stream webhook event", e);
            // Return 200 to prevent Stream from retrying (we'll handle errors internally)
            return ResponseEntity.ok("Event received but failed to process");
        }
    }
}
