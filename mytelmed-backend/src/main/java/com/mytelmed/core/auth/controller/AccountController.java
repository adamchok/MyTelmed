package com.mytelmed.core.auth.controller;

import com.mytelmed.common.dto.ApiResponse;
import com.mytelmed.core.auth.dto.UpdateAccountPasswordRequestDto;
import com.mytelmed.core.auth.dto.UpdateAccountUsernameRequestDto;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.auth.service.AccountService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/api/v1/account")
public class AccountController {
    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @PatchMapping("/username")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'PHARMACIST')")
    public ResponseEntity<ApiResponse<Void>> updateUsername(@AuthenticationPrincipal Account account,
                                                            @Valid @RequestBody UpdateAccountUsernameRequestDto request) {
        accountService.updateUsername(account, request);
        return ResponseEntity.ok(ApiResponse.success("Account username updated successfully"));
    }

    @PatchMapping("/password")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'PHARMACIST', 'PATIENT')")
    public ResponseEntity<ApiResponse<Void>> updatePassword(@AuthenticationPrincipal Account account,
                                                            @Valid @RequestBody UpdateAccountPasswordRequestDto request) {
        accountService.updatePassword(account, request);
        return ResponseEntity.ok(ApiResponse.success("Account password updated successfully"));
    }
}
