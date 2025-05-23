package com.mytelmed.core.family.service;

import com.mytelmed.common.advice.exception.ResourceNotFoundException;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.auth.service.AccountService;
import com.mytelmed.core.family.dto.CreateFamilyMemberRequestDto;
import com.mytelmed.core.family.dto.UpdateFamilyMemberRequestDto;
import com.mytelmed.core.family.entity.FamilyMember;
import com.mytelmed.core.family.repository.FamilyMemberRepository;
import com.mytelmed.core.patient.entity.Patient;
import com.mytelmed.core.patient.service.PatientService;
import com.mytelmed.infrastructure.email.service.EmailService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import java.util.List;
import java.util.Optional;
import java.util.UUID;


@Slf4j
@Service
public class FamilyMemberService {
    private final FamilyMemberRepository familyMemberRepository;
    private final PatientService patientService;
    private final AccountService accountService;
    private final EmailService emailService;
    private final String uiHost;

    public FamilyMemberService(FamilyMemberRepository familyMemberRepository, PatientService patientService, AccountService accountService,
                               EmailService emailService, @Value("${application.ui-host}") String uiHost) {
        this.familyMemberRepository = familyMemberRepository;
        this.patientService = patientService;
        this.accountService = accountService;
        this.emailService = emailService;
        this.uiHost = uiHost;
    }

    private String generateInvitationUrl(UUID familyMemberId) {
        return ServletUriComponentsBuilder.fromPath(uiHost)
                .path("/family/{familyMemberId}/confirm")
                .buildAndExpand(familyMemberId)
                .toUriString();
    }

    private void sendInvitationEmail(FamilyMember familyMember, Patient patient, String invitationUrl) {
        try {
            emailService.notifyNewFamilyMember(
                    familyMember.getEmail(),
                    familyMember.getName(),
                    patient.getName(),
                    invitationUrl);
        } catch (Exception e) {
            log.error("Failed to send family member invitation email to {}: {}",
                    familyMember.getEmail(), e.getMessage(), e);
        }
    }

    public FamilyMember getFamilyMemberById(UUID familyMemberId) {
        log.debug("Getting family member with ID: {}", familyMemberId);
        return familyMemberRepository.findById(familyMemberId)
                .orElseThrow(() -> {
                    log.warn("Family member not found with ID: {}", familyMemberId);
                    return new ResourceNotFoundException("Family member not found");
                });
    }

    public List<FamilyMember> getFamilyMembersByPatientId(UUID patientId) {
        log.debug("Getting all family members for patient ID: {}", patientId);
        Patient patient = patientService.getPatientById(patientId);
        return patient.getFamilyMemberList();
    }

    @Transactional
    public Optional<FamilyMember> inviteFamilyMember(UUID patientId, CreateFamilyMemberRequestDto request) {
        log.debug("Inviting new family member for patient ID: {}", patientId);

        try {
            Patient patient = patientService.getPatientById(patientId);

            boolean emailAlreadyExists = patient.getFamilyMemberList().stream()
                    .anyMatch(member -> member.getEmail().equals(request.email()));

            if (emailAlreadyExists) {
                log.warn("Email {} is already associated with a family member for patient {}",
                        request.email(), patientId);
                return Optional.empty();
            }

            Optional<Account> memberAccount = accountService.getAccountByUsername(request.nric());

            FamilyMember.FamilyMemberBuilder familyMemberBuilder = FamilyMember.builder()
                    .name(request.name())
                    .patient(patient)
                    .relationship(request.relationship())
                    .email(request.email())
                    .pending(true);

            memberAccount.ifPresent(familyMemberBuilder::memberAccount);

            FamilyMember familyMember = familyMemberBuilder.build();
            FamilyMember savedFamilyMember = familyMemberRepository.save(familyMember);

            String invitationUrl = generateInvitationUrl(savedFamilyMember.getId());

            sendInvitationEmail(savedFamilyMember, patient, invitationUrl);

            return Optional.of(savedFamilyMember);
        } catch (Exception e) {
            log.error("Unexpected error while inviting new family member for patient: {}", patientId, e);
        }
        return Optional.empty();
    }

    @Transactional
    public Optional<FamilyMember> confirmFamilyMember(UUID id) {
        log.debug("Confirming family member with ID: {}", id);

        try {
            FamilyMember familyMember = getFamilyMemberById(id);

            if (familyMember.isPending()) {
                log.info("Family member {} is already confirmed", id);
                return Optional.of(familyMember);
            }

            familyMember.setPending(false);

            if (familyMember.getMemberAccount() == null) {
                Account account = patientService.getPatientByEmail(familyMember.getEmail()).getAccount();
                familyMember.setMemberAccount(account);
            }

            FamilyMember savedMember = familyMemberRepository.save(familyMember);

            try {
                emailService.notifyFamilyMemberConfirmation(
                        familyMember.getEmail(),
                        familyMember.getName(),
                        familyMember.getPatient().getName());
            } catch (Exception e) {
                log.error("Failed to send family member confirmation email: {}", e.getMessage(), e);
            }

            return Optional.of(savedMember);
        } catch (Exception e) {
            log.error("Unexpected error while confirming family member: {}", id, e);
        }
        return Optional.empty();
    }

    @Transactional
    public Optional<FamilyMember> updateFamilyMember(UUID familyMemberId, UpdateFamilyMemberRequestDto request) {
        log.debug("Updating family member with ID: {}", familyMemberId);

        try {
            FamilyMember familyMember = getFamilyMemberById(familyMemberId);

            familyMember.setName(request.name());
            familyMember.setRelationship(request.relationship());

            return Optional.of(familyMemberRepository.save(familyMember));
        } catch (Exception e) {
            log.error("Unexpected error while updating family member: {}", familyMemberId, e);
        }
        return Optional.empty();
    }

    @Transactional
    public boolean deleteFamilyMember(UUID id) {
        log.debug("Deleting family member with ID: {}", id);

        try {
            FamilyMember familyMember = getFamilyMemberById(id);
            String email = familyMember.getEmail();
            String name = familyMember.getName();
            String patientName = familyMember.getPatient().getName();

            familyMemberRepository.delete(familyMember);

            try {
                emailService.notifyFamilyMemberRemoval(email, name, patientName);
            } catch (Exception e) {
                log.error("Failed to send family member removal notification: {}", e.getMessage(), e);
            }

            return true;
        } catch (Exception e) {
            log.error("Unexpected error while deleting family member: {}", id, e);
        }
        return false;
    }
}
