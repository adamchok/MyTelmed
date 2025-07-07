package com.mytelmed.core.chat.controller;

import com.mytelmed.common.dto.ApiResponse;
import com.mytelmed.common.dto.StreamTokenAndUserResponseDto;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.chat.service.ChatService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@Slf4j
@RestController
@RequestMapping("/chat")
public class ChatController {
    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PreAuthorize("hasAnyRole('PATIENT', 'NUTRITIONIST', 'DOCTOR')")
    @GetMapping
    public ResponseEntity<ApiResponse<StreamTokenAndUserResponseDto>> createAndGetStreamUserAndToken(
            @AuthenticationPrincipal Account account) {
        log.info("Received request to update Stream user and generate Stream token for account with ID: {}",
                account.getId());
        StreamTokenAndUserResponseDto response = chatService.createAndGetStreamUserAndToken(account);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
