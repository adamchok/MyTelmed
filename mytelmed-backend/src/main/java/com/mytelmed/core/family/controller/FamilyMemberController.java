package com.mytelmed.core.family.controller;

import com.mytelmed.common.dto.ApiResponse;
import com.mytelmed.core.family.dto.CreateFamilyMemberRequestDto;
import com.mytelmed.core.family.dto.FamilyMemberDto;
import com.mytelmed.core.family.dto.UpdateFamilyMemberRequestDto;
import com.mytelmed.core.family.entity.FamilyMember;
import com.mytelmed.core.family.mapper.FamilyMemberMapper;
import com.mytelmed.core.family.service.FamilyMemberService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
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

    public FamilyMemberController(FamilyMemberService familyMemberService, FamilyMemberMapper familyMemberMapper) {
        this.familyMemberService = familyMemberService;
        this.familyMemberMapper = familyMemberMapper;
    }

    @GetMapping("/{familyMemberId}")
    public ResponseEntity<ApiResponse<FamilyMemberDto>> getFamilyMember(
            @PathVariable UUID familyMemberId) {
        log.debug("Received request to get family member: {}", familyMemberId);
        FamilyMember familyMember = familyMemberService.getFamilyMemberById(familyMemberId);
        return ResponseEntity.ok(ApiResponse.success(familyMemberMapper.toDto(familyMember)));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<ApiResponse<List<FamilyMemberDto>>> getFamilyMembersByPatient(
            @PathVariable UUID patientId) {
        log.debug("Received request to get all family members for patient: {}", patientId);

        List<FamilyMember> familyMemberList = familyMemberService.getFamilyMembersByPatientId(patientId);
        List<FamilyMemberDto> familyMemberResponseDtoList = familyMemberList.stream()
                .map(familyMemberMapper::toDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(familyMemberResponseDtoList));
    }

    @GetMapping("/confirm/{familyMemberId}")
    public ResponseEntity<ApiResponse<Void>> confirmFamilyMember(
            @PathVariable UUID familyMemberId) {
        log.debug("Received request to confirm family member: {}", familyMemberId);

        familyMemberService.confirmFamilyMember(familyMemberId);
        return ResponseEntity.ok(ApiResponse.success("Family member confirmed successfully"));
    }

    @PostMapping("/patient/{patientId}")
    public ResponseEntity<ApiResponse<Void>> inviteFamilyMember(
            @PathVariable UUID patientId,
            @Valid @RequestBody CreateFamilyMemberRequestDto request) {
        log.debug("Received request to invite family member for patient: {}", patientId);

        familyMemberService.inviteFamilyMember(patientId, request);
        return ResponseEntity.ok(ApiResponse.success("Family member invitation sent successfully"));
    }

    @PutMapping("/{familyMemberId}")
    public ResponseEntity<ApiResponse<Void>> updateFamilyMember(
            @PathVariable UUID familyMemberId,
            @Valid @RequestBody UpdateFamilyMemberRequestDto request) {
        log.debug("Received request to update family member: {}", familyMemberId);

        familyMemberService.updateFamilyMember(familyMemberId, request);
        return ResponseEntity.ok(ApiResponse.success("Family member updated successfully"));
    }

    @DeleteMapping("/{familyMemberId}")
    public ResponseEntity<ApiResponse<Void>> deleteFamilyMember(
            @PathVariable UUID familyMemberId) {
        log.debug("Request request to delete family member: {}", familyMemberId);

        familyMemberService.deleteFamilyMember(familyMemberId);
        return ResponseEntity.ok(ApiResponse.success("Family member deleted successfully"));
    }
}
