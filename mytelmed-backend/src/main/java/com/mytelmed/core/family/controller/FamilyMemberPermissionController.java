package com.mytelmed.core.family.controller;

import com.mytelmed.common.dto.ApiResponse;
import com.mytelmed.common.utils.DateTimeUtil;
import com.mytelmed.core.family.dto.FamilyMemberPermissionDto;
import com.mytelmed.core.family.dto.UpdateFamilyPermissionsRequestDto;
import com.mytelmed.core.family.entity.FamilyMemberPermission;
import com.mytelmed.core.family.mapper.FamilyMemberPermissionMapper;
import com.mytelmed.core.family.service.FamilyMemberPermissionService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/v1/family/permissions")
public class FamilyMemberPermissionController {
    
    private final FamilyMemberPermissionService permissionService;
    private final FamilyMemberPermissionMapper permissionMapper;

    public FamilyMemberPermissionController(FamilyMemberPermissionService permissionService,
                                          FamilyMemberPermissionMapper permissionMapper) {
        this.permissionService = permissionService;
        this.permissionMapper = permissionMapper;
    }

    @PreAuthorize("hasRole('PATIENT')")
    @GetMapping("/family-member/{familyMemberId}")
    public ResponseEntity<ApiResponse<List<FamilyMemberPermissionDto>>> getFamilyMemberPermissions(
            @PathVariable UUID familyMemberId) {
        log.info("Received request to get permissions for family member: {}", familyMemberId);

        List<FamilyMemberPermission> permissions = permissionService.getFamilyMemberPermissions(familyMemberId);
        List<FamilyMemberPermissionDto> permissionDtos = permissions.stream()
                .map(permissionMapper::toDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(permissionDtos));
    }

    @PreAuthorize("hasRole('PATIENT')")
    @PutMapping("/family-member/{familyMemberId}/grant")
    public ResponseEntity<ApiResponse<Void>> grantPermissions(
            @PathVariable UUID familyMemberId,
            @Valid @RequestBody UpdateFamilyPermissionsRequestDto request,
            @AuthenticationPrincipal UserDetails userDetails) {
        log.info("Received request to grant permissions {} to family member: {}", 
                request.permissions(), familyMemberId);

        // Get patient account ID from authenticated user
        UUID patientAccountId = UUID.fromString(userDetails.getUsername());

        permissionService.grantPermissions(
                patientAccountId,
                familyMemberId,
                request.permissions(),
                DateTimeUtil.stringToLocalDate(request.expiryDate()).orElse(null)
        );

        return ResponseEntity.ok(ApiResponse.success("Permissions granted successfully"));
    }

    @PreAuthorize("hasRole('PATIENT')")
    @PutMapping("/family-member/{familyMemberId}/revoke")
    public ResponseEntity<ApiResponse<Void>> revokePermissions(
            @PathVariable UUID familyMemberId,
            @Valid @RequestBody UpdateFamilyPermissionsRequestDto request,
            @AuthenticationPrincipal UserDetails userDetails) {
        log.info("Received request to revoke permissions {} from family member: {}", 
                request.permissions(), familyMemberId);

        // Get patient account ID from authenticated user
        UUID patientAccountId = UUID.fromString(userDetails.getUsername());

        permissionService.revokePermissions(
                patientAccountId,
                familyMemberId,
                request.permissions()
        );

        return ResponseEntity.ok(ApiResponse.success("Permissions revoked successfully"));
    }
}
