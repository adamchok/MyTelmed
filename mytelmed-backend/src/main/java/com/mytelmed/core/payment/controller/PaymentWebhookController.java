package com.mytelmed.core.payment.controller;

import com.mytelmed.common.advice.AppException;
import com.mytelmed.core.payment.service.PaymentWebhookService;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.net.Webhook;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.io.BufferedReader;
import java.io.IOException;
import java.util.stream.Collectors;


/**
 * Webhook controller for handling Stripe payment events.
 * Processes payment confirmations and updates appointment statuses
 * automatically.
 */
@Slf4j
@RestController
@RequestMapping("/api/payment/webhook")
public class PaymentWebhookController {
    private final PaymentWebhookService webhookService;
    private final String endpointSecret;

    public PaymentWebhookController(PaymentWebhookService webhookService,
                                    @Value("${stripe.webhook.endpoint.secret:}") String endpointSecret) {
        this.webhookService = webhookService;
        this.endpointSecret = endpointSecret;
    }

    @PostMapping("/stripe")
    public ResponseEntity<String> handleStripeWebhook(HttpServletRequest request) {
        String sigHeader = request.getHeader("Stripe-Signature");

        String payload;
        try (BufferedReader reader = request.getReader()) {
            payload = reader.lines().collect(Collectors.joining("\n"));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to read request");
        }

        Event event;
        try {
            // Verify webhook signature
            event = Webhook.constructEvent(payload, sigHeader, endpointSecret);
            log.info("Successfully verified webhook signature for event: {}", event.getType());
        } catch (SignatureVerificationException e) {
            log.error("Invalid webhook signature: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid signature");
        } catch (Exception e) {
            log.error("Error parsing webhook payload: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid payload");
        }

        try {
            // Process the webhook event
            webhookService.processWebhookEvent(event);
            log.info("Successfully processed webhook event: {}", event.getType());
            return ResponseEntity.ok("Event processed successfully");
        } catch (AppException e) {
            log.error("Business logic error processing webhook event {}: {}", event.getType(), e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error processing event: " + e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error processing webhook event {}: {}", event.getType(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Internal server error");
        }
    }
}
