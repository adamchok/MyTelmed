package com.mytelmed.core.family.service;

import com.mytelmed.common.advice.AppException;
import com.mytelmed.common.advice.exception.InvalidInputException;
import com.mytelmed.common.advice.exception.ResourceNotFoundException;
import com.mytelmed.common.event.family.model.FamilyMemberInviteEvent;
import com.mytelmed.common.event.family.model.FamilyMemberJoinedEvent;
import com.mytelmed.common.event.family.model.FamilyMemberRemovedEvent;
import com.mytelmed.common.utils.HashUtil;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.auth.service.AccountService;
import com.mytelmed.core.family.dto.CreateFamilyMemberRequestDto;
import com.mytelmed.core.family.dto.UpdateFamilyMemberRequestDto;
import com.mytelmed.core.family.dto.UpdateFamilyPermissionsRequestDto;
import com.mytelmed.core.family.entity.FamilyMember;
import com.mytelmed.core.family.repository.FamilyMemberRepository;
import com.mytelmed.core.patient.entity.Patient;
import com.mytelmed.core.patient.service.PatientService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
public class FamilyMemberService {
    private final FamilyMemberRepository familyMemberRepository;
    private final PatientService patientService;
    private final AccountService accountService;
    private final String frontendUrl;
    private final ApplicationEventPublisher applicationEventPublisher;

    public FamilyMemberService(FamilyMemberRepository familyMemberRepository, PatientService patientService,
            AccountService accountService,
            @Value("${application.frontend.url}") String frontendUrl,
            ApplicationEventPublisher applicationEventPublisher) {
        this.familyMemberRepository = familyMemberRepository;
        this.patientService = patientService;
        this.accountService = accountService;
        this.frontendUrl = frontendUrl;
        this.applicationEventPublisher = applicationEventPublisher;
    }

    @Transactional(readOnly = true)
    public FamilyMember findById(UUID familyMemberId) throws ResourceNotFoundException {
        log.debug("Finding family member with ID: {}", familyMemberId);

        FamilyMember familyMember = familyMemberRepository.findById(familyMemberId)
                .orElseThrow(() -> {
                    log.warn("Family member not found with ID: {}", familyMemberId);
                    return new ResourceNotFoundException("Family member not found");
                });

        log.debug("Found family member with ID: {}", familyMemberId);
        return familyMember;
    }

    @Transactional(readOnly = true)
    public List<FamilyMember> findAllByPatientId(UUID patientId) {
        log.debug("Finding all family members with patient ID: {}", patientId);
        return familyMemberRepository.findAllByPatientId(patientId);
    }

    @Transactional(readOnly = true)
    public List<FamilyMember> findAllByMemberAccount(Account account) {
        log.debug("Finding all family members with member account ID: {}", account.getId());
        return familyMemberRepository.findAllByMemberAccount(account);
    }

    @Transactional(readOnly = true)
    public List<FamilyMember> findPendingInvitationsByMemberAccount(Account account) {
        log.debug("Finding pending invitations for account with member account ID: {}", account.getId());
        String hashedUsername = HashUtil.sha256(account.getUsername());
        return familyMemberRepository.findAllByHashedNricAndPendingTrue(hashedUsername);
    }

    @Transactional
    public void invite(Account patientAccount, CreateFamilyMemberRequestDto request) throws AppException {
        log.debug("Inviting new family member for patient account with ID: {}", patientAccount.getId());

        Patient patient = patientService.findPatientByAccountId(patientAccount.getId());

        // Check for NRIC duplication
        boolean nricAlreadyExist = patient.getFamilyMemberList().stream()
                .anyMatch(member -> member.getNric().equals(request.nric()));

        if (nricAlreadyExist) {
            log.warn("Family member {} is already associated with for patient {}", request.nric(),
                    patient.getId());
            throw new InvalidInputException("NRIC is already associated with a family member");
        }

        try {
            // Try to find existing account by NRIC, but don't fail if not found
            // The family member can be invited even if they don't have an account yet
            Account memberAccount = null;
            try {
                memberAccount = accountService.getAccountByUsername(request.nric());
            } catch (Exception e) {
                log.debug("No existing account found for NRIC: {}, family member will be invited without account",
                        request.nric());
            }

            FamilyMember familyMember = FamilyMember.builder()
                    .name(request.name())
                    .nric(request.nric())
                    .patient(patient)
                    .relationship(request.relationship())
                    .email(request.email())
                    .memberAccount(memberAccount)
                    .pending(true)
                    // Default permissions - all false for security
                    .canViewMedicalRecords(false)
                    .canViewAppointments(false)
                    .canManageAppointments(false)
                    .canViewPrescriptions(false)
                    .canManagePrescriptions(false)
                    .canViewBilling(false)
                    .canManageBilling(false)
                    .build();

            FamilyMember savedFamilyMember = familyMemberRepository.save(familyMember);
            String invitationUrl = generateInvitationUrl(savedFamilyMember.getId());

            FamilyMemberInviteEvent event = FamilyMemberInviteEvent.builder()
                    .memberEmail(savedFamilyMember.getEmail())
                    .inviteeName(savedFamilyMember.getName())
                    .inviterName(patient.getName())
                    .relationship(savedFamilyMember.getRelationship())
                    .invitationUrl(invitationUrl)
                    .build();

            applicationEventPublisher.publishEvent(event);
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error while inviting new family member for patient account ID: {}",
                    patientAccount.getId(), e);
            throw new AppException("Failed to invite new family member");
        }
    }

    @Transactional
    public void confirm(Account account, FamilyMember familyMember) throws AppException {
        log.debug("Confirming family member with ID: {}", familyMember.getId());

        try {
            if (!familyMember.isPending()) {
                log.info("Family member {} is already confirmed", familyMember.getId());
                throw new AppException("Family member is already confirmed");
            }

            if (familyMember.getMemberAccount() == null) {
                familyMember.setMemberAccount(account);
            }

            familyMember.setPending(false);
            FamilyMember savedMember = familyMemberRepository.save(familyMember);

            FamilyMemberJoinedEvent event = FamilyMemberJoinedEvent.builder()
                    .memberEmail(savedMember.getEmail())
                    .memberName(savedMember.getName())
                    .patientName(savedMember.getPatient().getName())
                    .build();

            applicationEventPublisher.publishEvent(event);

            log.info("Family member {} confirmed", savedMember.getId());
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error while confirming family member: {}", familyMember.getId(), e);
            throw new AppException("Failed to confirm family member");
        }
    }

    @Transactional
    public void update(FamilyMember familyMember, UpdateFamilyMemberRequestDto request) {
        log.debug("Updating family member with ID: {}", familyMember.getId());

        try {
            familyMember.setName(request.name());
            familyMember.setRelationship(request.relationship());

            familyMemberRepository.save(familyMember);
            log.info("Updated family member with ID: {}", familyMember.getId());
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error while updating family member: {}", familyMember.getId(), e);
            throw new AppException("Failed to update family member");
        }
    }

    @Transactional
    public void updatePermissions(FamilyMember familyMember, UpdateFamilyPermissionsRequestDto request) {
        log.debug("Updating permissions for family member with ID: {}", familyMember.getId());

        try {
            familyMember.setCanViewMedicalRecords(request.canViewMedicalRecords());
            familyMember.setCanViewAppointments(request.canViewAppointments());
            familyMember.setCanManageAppointments(request.canManageAppointments());
            familyMember.setCanViewPrescriptions(request.canViewPrescriptions());
            familyMember.setCanManagePrescriptions(request.canManagePrescriptions());
            familyMember.setCanViewBilling(request.canViewBilling());
            familyMember.setCanManageBilling(request.canManageBilling());

            familyMemberRepository.save(familyMember);
            log.info("Updated permissions for family member with ID: {}", familyMember.getId());
        } catch (Exception e) {
            log.error("Unexpected error while updating permissions for family member: {}", familyMember.getId(), e);
            throw new AppException("Failed to update family member permissions");
        }
    }

    @Transactional
    public void delete(FamilyMember familyMember) throws AppException {
        log.debug("Deleting family member with ID: {}", familyMember.getId());

        try {
            String email = familyMember.getEmail();
            String name = familyMember.getName();
            String patientName = familyMember.getPatient().getName();

            familyMemberRepository.delete(familyMember);

            FamilyMemberRemovedEvent event = FamilyMemberRemovedEvent.builder()
                    .memberEmail(email)
                    .memberName(name)
                    .patientName(patientName)
                    .build();

            applicationEventPublisher.publishEvent(event);
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error while deleting family member: {}", familyMember.getId(), e);
            throw new AppException("Failed to delete family member");
        }
    }

    private String generateInvitationUrl(UUID familyMemberId) {
        log.debug("Generating invitation URL for family member with ID: {}", familyMemberId);
        return frontendUrl + "/patient/family/" + familyMemberId;
    }
}
