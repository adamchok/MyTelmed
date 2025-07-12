package com.mytelmed.core.family.controller;

import com.mytelmed.common.dto.ApiResponse;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.family.dto.UpdateFamilyPermissionsRequestDto;
import com.mytelmed.core.family.entity.FamilyMember;
import com.mytelmed.core.family.service.FamilyMemberService;
import com.mytelmed.core.patient.service.PatientService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.UUID;


@Slf4j
@RestController
@RequestMapping("/api/v1/family/permissions")
public class FamilyMemberPermissionController {
    private final FamilyMemberService familyMemberService;
    private final PatientService patientService;

    public FamilyMemberPermissionController(FamilyMemberService familyMemberService,
                                           PatientService patientService) {
        this.familyMemberService = familyMemberService;
        this.patientService = patientService;
    }

    @PutMapping("/{familyMemberId}")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<Void>> updatePermissions(
            @PathVariable UUID familyMemberId,
            @Valid @RequestBody UpdateFamilyPermissionsRequestDto request,
            @AuthenticationPrincipal Account account) {
        log.info("Received request to update permissions for family member: {} by patient account: {}",
                familyMemberId, account.getId());

        // Get patient ID from authenticated account
        UUID patientId = patientService.findPatientByAccountId(account.getId()).getId();
        
        // Verify the family member belongs to the authenticated patient
        FamilyMember familyMember = familyMemberService.findById(familyMemberId);
        if (!familyMember.getPatient().getId().equals(patientId)) {
            log.warn("Unauthorized access attempt: Patient {} tried to update permissions for family member {} which belongs to patient {}", 
                    patientId, familyMemberId, familyMember.getPatient().getId());
            return ResponseEntity.status(403).body(ApiResponse.failure("Unauthorized access to family member"));
        }

        familyMemberService.updatePermissions(familyMember, request);
        return ResponseEntity.ok(ApiResponse.success("Permissions updated successfully"));
    }
}
