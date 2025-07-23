package com.mytelmed.core.family.controller;

import com.mytelmed.common.dto.ApiResponse;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.family.dto.CreateFamilyMemberRequestDto;
import com.mytelmed.core.family.dto.FamilyMemberDto;
import com.mytelmed.core.family.dto.UpdateFamilyMemberRequestDto;
import com.mytelmed.core.family.entity.FamilyMember;
import com.mytelmed.core.family.mapper.FamilyMemberMapper;
import com.mytelmed.core.family.service.FamilyMemberService;
import com.mytelmed.core.patient.service.PatientService;
import com.mytelmed.infrastructure.aws.service.AwsS3Service;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;


@Slf4j
@RestController
@RequestMapping("/api/v1/family")
public class FamilyMemberController {
    private final FamilyMemberService familyMemberService;
    private final FamilyMemberMapper familyMemberMapper;
    private final PatientService patientService;
    private final AwsS3Service awsS3Service;

    public FamilyMemberController(FamilyMemberService familyMemberService,
                                  FamilyMemberMapper familyMemberMapper,
                                  PatientService patientService,
                                  AwsS3Service awsS3Service) {
        this.familyMemberService = familyMemberService;
        this.familyMemberMapper = familyMemberMapper;
        this.patientService = patientService;
        this.awsS3Service = awsS3Service;
    }

    /**
     * The patient can fetch their family members
     */
    @GetMapping
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<List<FamilyMemberDto>>> getFamilyMembersByPatientAccount(
            @AuthenticationPrincipal Account account
    ) {
        log.debug("Received request to get all family members for patient with account ID: {}", account.getId());

        // Get patient ID from authenticated account
        UUID patientId = patientService.findPatientByAccountId(account.getId()).getId();

        List<FamilyMember> familyMemberList = familyMemberService.findAllByPatientId(patientId);
        List<FamilyMemberDto> familyMemberResponseDtoList = familyMemberList.stream()
                .map(familyMember -> familyMemberMapper.toDto(familyMember, awsS3Service))
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(familyMemberResponseDtoList));
    }

    /**
     * The family member can fetch the patients they can manage
     */
    @GetMapping("/patients")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<List<FamilyMemberDto>>> getPatientsByMemberAccount(
            @AuthenticationPrincipal Account account
    ) {
        log.debug("Received request to get all patients for family member with account ID: {}", account.getId());

        List<FamilyMember> familyMemberList = familyMemberService.findAllByMemberAccount(account);
        List<FamilyMemberDto> familyMemberResponseDtoList = familyMemberList.stream()
                .map(familyMember -> familyMemberMapper.toDto(familyMember, awsS3Service))
                .collect(Collectors.toList());

        log.info("Family member {} has access to patients: {}", account.getUsername(), familyMemberResponseDtoList);

        return ResponseEntity.ok(ApiResponse.success(familyMemberResponseDtoList));
    }

    /**
     * The family member can fetch their pending invitations
     */
    @GetMapping("/pending")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<List<FamilyMemberDto>>> getPendingInvitations(
            @AuthenticationPrincipal Account account
    ) {
        log.debug("Received request to get pending invitations for account ID: {}", account.getId());

        List<FamilyMember> pendingInvitations = familyMemberService.findPendingInvitationsByMemberAccount(account);
        List<FamilyMemberDto> pendingInvitationsDto = pendingInvitations.stream()
                .map(familyMember -> familyMemberMapper.toDto(familyMember, awsS3Service))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(pendingInvitationsDto));
    }

    @GetMapping("/confirm/{familyMemberId}")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<Void>> confirmFamilyMember(
            @PathVariable UUID familyMemberId,
            @AuthenticationPrincipal Account account
    ) {
        log.debug("Received request to confirm family member: {} by account: {}", familyMemberId, account.getId());

        // Verify the family member invitation belongs to the authenticated account
        FamilyMember familyMember = familyMemberService.findById(familyMemberId);
        if (!familyMember.getNric().equals(account.getUsername()) &&
                (familyMember.getMemberAccount() == null || !familyMember.getMemberAccount().getId().equals(account.getId()))) {
            log.warn("Unauthorized confirmation attempt: Account {} tried to confirm family member {} with email {}",
                    account.getId(), familyMemberId, familyMember.getEmail());
            return ResponseEntity.status(403).body(ApiResponse.failure("Unauthorized to confirm this family member invitation"));
        }

        familyMemberService.confirm(account, familyMember);
        return ResponseEntity.ok(ApiResponse.success("Family member confirmed successfully"));
    }

    @GetMapping("/decline/{familyMemberId}")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<Void>> declineFamilyMember(
            @PathVariable UUID familyMemberId,
            @AuthenticationPrincipal Account account
    ) {
        log.debug("Received request to decline family member invite: {} by account: {}", familyMemberId, account.getId());

        // Verify the family member invitation belongs to the authenticated account
        FamilyMember familyMember = familyMemberService.findById(familyMemberId);
        if (!familyMember.getNric().equals(account.getUsername()) &&
                (familyMember.getMemberAccount() == null || !familyMember.getMemberAccount().getId().equals(account.getId()))) {
            log.warn("Unauthorized decline attempt: Account {} tried to confirm family member {} with email {}",
                    account.getId(), familyMemberId, familyMember.getEmail());
            return ResponseEntity.status(403).body(ApiResponse.failure("Unauthorized to decline this family member invitation"));
        }

        familyMemberService.decline(familyMember);
        return ResponseEntity.ok(ApiResponse.success("Invite declined successfully"));
    }

    @PostMapping
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<Void>> inviteFamilyMember(
            @Valid @RequestBody CreateFamilyMemberRequestDto request,
            @AuthenticationPrincipal Account account) {
        log.debug("Received request to invite family member for patient account: {}", account.getId());

        familyMemberService.invite(account, request);
        return ResponseEntity.ok(ApiResponse.success("Family member invitation sent successfully"));
    }

    @PutMapping("/{familyMemberId}")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<Void>> updateFamilyMember(
            @PathVariable UUID familyMemberId,
            @Valid @RequestBody UpdateFamilyMemberRequestDto request,
            @AuthenticationPrincipal Account account
    ) {
        log.debug("Received request to update family member: {} for patient account: {}", familyMemberId, account.getId());

        // Get patient ID from authenticated account
        UUID patientId = patientService.findPatientByAccountId(account.getId()).getId();

        // Verify the family member belongs to the authenticated patient
        FamilyMember familyMember = familyMemberService.findById(familyMemberId);
        if (!familyMember.getPatient().getId().equals(patientId)) {
            log.warn("Unauthorized access attempt: Patient {} tried to update family member {} which belongs to patient {}",
                    patientId, familyMemberId, familyMember.getPatient().getId());
            return ResponseEntity.status(403).body(ApiResponse.failure("Unauthorized access to family member"));
        }

        familyMemberService.update(familyMember, request);
        return ResponseEntity.ok(ApiResponse.success("Family member updated successfully"));
    }

    @DeleteMapping("/{familyMemberId}")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<Void>> deleteFamilyMember(
            @PathVariable UUID familyMemberId,
            @AuthenticationPrincipal Account account
    ) {
        log.debug("Received request to delete family member: {} for patient account: {}", familyMemberId, account.getId());

        // Get patient ID from authenticated account
        UUID patientId = patientService.findPatientByAccountId(account.getId()).getId();

        // Verify the family member belongs to the authenticated patient
        FamilyMember familyMember = familyMemberService.findById(familyMemberId);
        if (!familyMember.getPatient().getId().equals(patientId)) {
            log.warn("Unauthorized access attempt: Patient {} tried to delete family member {} which belongs to patient {}",
                    patientId, familyMemberId, familyMember.getPatient().getId());
            return ResponseEntity.status(403).body(ApiResponse.failure("Unauthorized access to family member"));
        }

        familyMemberService.delete(familyMember);
        return ResponseEntity.ok(ApiResponse.success("Family member deleted successfully"));
    }
}
