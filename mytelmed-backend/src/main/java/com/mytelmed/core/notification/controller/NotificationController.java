package com.mytelmed.core.notification.controller;

import com.mytelmed.common.dto.ApiResponse;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.notification.dto.NotificationDto;
import com.mytelmed.core.notification.dto.PushSubscriptionRequestDto;
import com.mytelmed.core.notification.mapper.NotificationMapper;
import com.mytelmed.core.notification.service.NotificationService;
import com.mytelmed.core.notification.service.WebPushService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.util.UUID;


@RestController
@RequestMapping("api/v1/notification")
public class NotificationController {
    private final NotificationMapper notificationMapper;
    private final NotificationService notificationService;
    private final WebPushService webPushService;

    public NotificationController(NotificationMapper notificationMapper, NotificationService notificationService, WebPushService webPushService) {
        this.notificationMapper = notificationMapper;
        this.notificationService = notificationService;
        this.webPushService = webPushService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<NotificationDto>>> getNotifications(
            @AuthenticationPrincipal Account account,
            @RequestParam(value = "page", defaultValue = "0") Integer page,
            @RequestParam(value = "pageSize", defaultValue = "10") Integer pageSize
    ) {
        Page<NotificationDto> paginatedNotificationDto = notificationService.getPaginatedNotificationsByAccountId(account.getId(), page, pageSize)
                .map(notificationMapper::toDto);
        return ResponseEntity.ok(ApiResponse.success(paginatedNotificationDto));
    }

    @GetMapping("/unread")
    public ResponseEntity<ApiResponse<List<NotificationDto>>> getUnreadNotifications(@AuthenticationPrincipal Account account) {
        List<NotificationDto> notificationDtoList = notificationService.getUnreadNotifications(account.getId()).stream()
                .map(notificationMapper::toDto)
                .toList();
        return ResponseEntity.ok(ApiResponse.success(notificationDtoList));
    }

    @GetMapping("/unread/count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(@AuthenticationPrincipal Account account) {
        long unreadCount = notificationService.getUnreadCount(account.getId());
        return ResponseEntity.ok(ApiResponse.success(unreadCount));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable UUID id, @AuthenticationPrincipal Account account) {
        notificationService.markAsReadByAccountId(id, account.getId());
        return ResponseEntity.ok(ApiResponse.success());
    }

    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse<Long>> markAllAsRead(@AuthenticationPrincipal Account account) {
        long updatedCount = notificationService.markAllAsRead(account.getId());
        return ResponseEntity.ok(ApiResponse.success(updatedCount));
    }

    @PostMapping("/push-subscription")
    public ResponseEntity<Void> subscribe(
            @AuthenticationPrincipal Account account,
            @RequestBody @Valid PushSubscriptionRequestDto request) {

        webPushService.subscribe(
                account.getId(),
                request.endpoint(),
                request.keys().p256dh(),
                request.keys().auth()
        );

        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/push-subscription")
    public ResponseEntity<Void> unsubscribe(
            @AuthenticationPrincipal Account account,
            @RequestBody String endpoint) {

        webPushService.unsubscribe(account.getId(), endpoint);
        return ResponseEntity.ok().build();
    }
}
