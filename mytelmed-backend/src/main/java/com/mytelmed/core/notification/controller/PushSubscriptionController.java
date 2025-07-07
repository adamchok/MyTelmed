package com.mytelmed.core.notification.controller;

import com.mytelmed.common.dto.ApiResponse;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.notification.dto.PushSubscriptionRequestDto;
import com.mytelmed.core.notification.service.PushSubscriptionService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;


@Slf4j
@RestController
@RequestMapping("/push-subscriptions")
public class PushSubscriptionController {
    private final PushSubscriptionService subscriptionService;

    public PushSubscriptionController(PushSubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    @PostMapping("/subscribe")
    public ResponseEntity<ApiResponse<Void>> subscribe(
            @Valid @RequestBody PushSubscriptionRequestDto request,
            @AuthenticationPrincipal Account account) {
        log.info("Received push subscription request from account: {}", account.getId());

        subscriptionService.subscribe(account, request);

        return ResponseEntity.ok(ApiResponse.success("Push notification subscription successful"));
    }

    @DeleteMapping("/unsubscribe")
    public ResponseEntity<ApiResponse<Void>> unsubscribe(
            @RequestParam String endpoint,
            @AuthenticationPrincipal Account account) {
        log.info("Received unsubscribe request from account: {}", account.getId());

        subscriptionService.unsubscribe(account, endpoint);

        return ResponseEntity.ok(ApiResponse.success("Push notification subscription unsubscribed successfully"));
    }

    @DeleteMapping("/unsubscribe/all")
    public ResponseEntity<ApiResponse<Void>> unsubscribeAll(@AuthenticationPrincipal Account account) {
        log.info("Received unsubscribe all request from account: {}", account.getId());

        subscriptionService.unsubscribeAllByAccountId(account.getId());

        return ResponseEntity.ok(ApiResponse.success("All push notification subscriptions unsubscribed successfully"));
    }
}
