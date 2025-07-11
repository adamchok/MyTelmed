package com.mytelmed.core.admin.controller;

import com.mytelmed.common.dto.ApiResponse;
import com.mytelmed.core.admin.dto.AdminDto;
import com.mytelmed.core.admin.dto.CreateAdminRequestDto;
import com.mytelmed.core.admin.dto.UpdateAdminProfileRequestDto;
import com.mytelmed.core.admin.dto.UpdateAdminRequestDto;
import com.mytelmed.core.admin.entity.Admin;
import com.mytelmed.core.admin.mapper.AdminMapper;
import com.mytelmed.core.admin.service.AdminService;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.infrastructure.aws.service.AwsS3Service;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.UUID;


@Slf4j
@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {
    private final AdminService adminService;
    private final AwsS3Service awsS3Service;
    private final AdminMapper adminMapper;

    public AdminController(AdminService adminService,
                           AwsS3Service awsS3Service,
                           AdminMapper adminMapper) {
        this.adminService = adminService;
        this.awsS3Service = awsS3Service;
        this.adminMapper = adminMapper;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<AdminDto>>> getAllAdmin(
            @RequestParam Integer page,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize,
            @AuthenticationPrincipal Account account
    ) {
        log.info("Received request to get all admins with page: {} and page size: {}", page, pageSize);

        Page<Admin> paginatedAdmin = adminService.findAll(page, pageSize);

        // Filter out the currently authenticated user's Admin
        List<Admin> filteredAdmins = paginatedAdmin.getContent()
                .stream()
                .filter(admin -> !admin.getAccount().getId().equals(account.getId()))
                .toList();

        Page<Admin> filteredPage = new PageImpl<>(
                filteredAdmins,
                paginatedAdmin.getPageable(),
                paginatedAdmin.getTotalElements() - 1
        );

        Page<AdminDto> paginatedAdminDto = filteredPage.map(admin -> adminMapper.toDto(admin, awsS3Service));

        return ResponseEntity.ok(ApiResponse.success(paginatedAdminDto));
    }

    @GetMapping("/{adminId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AdminDto>> getAdminById(@PathVariable UUID adminId) {
        log.info("Received request to get admin with ID: {}", adminId);

        Admin admin = adminService.findById(adminId);
        AdminDto adminDto = adminMapper.toDto(admin, awsS3Service);
        return ResponseEntity.ok(ApiResponse.success(adminDto));
    }

    @GetMapping("/profile")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AdminDto>> getAdminProfile(@AuthenticationPrincipal Account account) {
        log.info("Received request to get admin profile for account with ID: {}", account.getId());

        Admin admin = adminService.findByAccount(account);
        AdminDto adminDto = adminMapper.toDto(admin, awsS3Service);
        return ResponseEntity.ok(ApiResponse.success(adminDto));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> createAdmin(@Valid @RequestBody CreateAdminRequestDto request) {
        log.info("Received request to create admin with request: {}", request);

        adminService.create(request);
        return ResponseEntity.ok(ApiResponse.success("Admin created successfully"));
    }

    @PatchMapping("/{adminId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> updateAdmin(
            @PathVariable UUID adminId,
            @Valid @RequestBody UpdateAdminRequestDto request
    ) {
        log.info("Received request to update admin with ID: {}", adminId);

        adminService.update(adminId, request);
        return ResponseEntity.ok(ApiResponse.success("Admin updated successfully"));
    }

    @PatchMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> updateAdminProfile(
            @RequestBody UpdateAdminProfileRequestDto request,
            @AuthenticationPrincipal Account account
    ) {
        log.info("Received request to update admin profile for account with ID: {}", account.getId());

        adminService.updateByAccount(account, request);
        return ResponseEntity.ok(ApiResponse.success("Admin profile updated successfully"));
    }

    @PutMapping(value = "/profile/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> updateAdminProfileImage(
            @RequestPart(value = "profileImage") MultipartFile profileImage,
            @AuthenticationPrincipal Account account) {
        log.info("Received request to update admin profile image for account with ID: {}", account.getId());

        adminService.updateProfileImageByAccount(account, profileImage);
        return ResponseEntity.ok(ApiResponse.success("Admin profile image updated successfully"));
    }

    @DeleteMapping("/{adminId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteAdmin(@PathVariable UUID adminId) {
        log.info("Received request to delete admin with ID: {}", adminId);

        adminService.deleteById(adminId);
        return ResponseEntity.ok(ApiResponse.success("Admin deleted successfully"));
    }

    @PostMapping("/activate/{adminId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> activateAdminById(@PathVariable UUID adminId) {
        log.info("Received request to activate admin with ID: {}", adminId);

        adminService.activateById(adminId);
        return ResponseEntity.ok(ApiResponse.success("Admin account activated successfully"));
    }

    @PostMapping("/deactivate/{adminId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deactivateAdminById(@PathVariable UUID adminId) {
        log.info("Received request to deactivate admin with ID: {}", adminId);

        adminService.deactivateById(adminId);
        return ResponseEntity.ok(ApiResponse.success("Admin account deactivated successfully"));
    }

    @PostMapping("/reset/password/{adminId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> resetAdminAccountPassword(@PathVariable UUID adminId) {
        log.info("Received request to reset admin account password for admin with ID: {}", adminId);

        adminService.resetAccountPassword(adminId);
        return ResponseEntity.ok(ApiResponse.success("Admin account password reset successfully"));
    }
}
