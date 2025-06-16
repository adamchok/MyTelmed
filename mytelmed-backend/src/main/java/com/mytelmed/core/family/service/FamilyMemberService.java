package com.mytelmed.core.family.service;

import com.mytelmed.common.advice.AppException;
import com.mytelmed.common.advice.exception.EmailSendingException;
import com.mytelmed.common.advice.exception.InvalidInputException;
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

    private void sendInvitationEmail(FamilyMember familyMember, Patient patient, String invitationUrl) throws EmailSendingException {
        emailService.sendFamilyMemberInvitationEmail(familyMember.getEmail(), familyMember.getName(), patient.getName(), invitationUrl);
    }

    @Transactional(readOnly = true)
    public FamilyMember getFamilyMemberById(UUID familyMemberId) throws ResourceNotFoundException {
        log.debug("Getting family member with ID: {}", familyMemberId);

        return familyMemberRepository.findById(familyMemberId)
                .orElseThrow(() -> {
                    log.warn("Family member not found with ID: {}", familyMemberId);
                    return new ResourceNotFoundException("Family member not found");
                });
    }

    @Transactional(readOnly = true)
    public List<FamilyMember> getFamilyMembersByPatientId(UUID patientId) throws ResourceNotFoundException {
        log.debug("Getting all family members for patient ID: {}", patientId);

        Patient patient = patientService.findPatientById(patientId);
        return patient.getFamilyMemberList();
    }

    @Transactional
    public void inviteFamilyMember(UUID patientId, CreateFamilyMemberRequestDto request) throws AppException {
        log.debug("Inviting new family member for patient ID: {}", patientId);

        try {
            Patient patient = patientService.findPatientById(patientId);

            boolean emailAlreadyExists = patient.getFamilyMemberList().stream()
                    .anyMatch(member -> member.getEmail().equals(request.email()));

            if (emailAlreadyExists) {
                log.warn("Email {} is already associated with a family member for patient {}", request.email(), patientId);
                throw new InvalidInputException("Email is already associated with a family member");
            }

            Account memberAccount = accountService.getAccountByUsername(request.nric());

            FamilyMember familyMember = FamilyMember.builder()
                    .name(request.name())
                    .patient(patient)
                    .relationship(request.relationship())
                    .email(request.email())
                    .memberAccount(memberAccount)
                    .pending(true)
                    .build();

            FamilyMember savedFamilyMember = familyMemberRepository.save(familyMember);

            String invitationUrl = generateInvitationUrl(savedFamilyMember.getId());
            sendInvitationEmail(savedFamilyMember, patient, invitationUrl);
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error while inviting new family member for patient: {}", patientId, e);
            throw new AppException("Failed to invite new family member");
        }
    }

    @Transactional
    public void confirmFamilyMember(UUID familyMemberId) throws AppException {
        log.debug("Confirming family member with ID: {}", familyMemberId);

        try {
            FamilyMember familyMember = getFamilyMemberById(familyMemberId);

            if (familyMember.isPending()) {
                log.info("Family member {} is already confirmed", familyMemberId);
                throw new AppException("Family member is already confirmed");
            }

            familyMember.setPending(false);

            if (familyMember.getMemberAccount() == null) {
                Account account = patientService.findPatientByEmail(familyMember.getEmail()).getAccount();
                familyMember.setMemberAccount(account);
            }

            FamilyMember savedMember = familyMemberRepository.save(familyMember);

            emailService.sendFamilyMemberJoinedEmail(
                    familyMember.getEmail(),
                    familyMember.getName(),
                    familyMember.getPatient().getName());

            log.info("Family member {} confirmed", savedMember.getId());
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error while confirming family member: {}", familyMemberId, e);
            throw new AppException("Failed to confirm family member");
        }
    }

    @Transactional
    public void updateFamilyMember(UUID familyMemberId, UpdateFamilyMemberRequestDto request) {
        log.debug("Updating family member with ID: {}", familyMemberId);

        try {
            FamilyMember familyMember = getFamilyMemberById(familyMemberId);

            familyMember.setName(request.name());
            familyMember.setRelationship(request.relationship());

            familyMemberRepository.save(familyMember);
            log.info("Updated family member with ID: {}", familyMemberId);
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error while updating family member: {}", familyMemberId, e);
            throw new AppException("Failed to update family member");
        }
    }

    @Transactional
    public void deleteFamilyMember(UUID familyMemberId) {
        log.debug("Deleting family member with ID: {}", familyMemberId);

        try {
            FamilyMember familyMember = getFamilyMemberById(familyMemberId);
            String email = familyMember.getEmail();
            String name = familyMember.getName();
            String patientName = familyMember.getPatient().getName();

            familyMemberRepository.delete(familyMember);

            emailService.sendFamilyMemberRemovedEmail(email, name, patientName);
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error while deleting family member: {}", familyMemberId, e);
            throw new AppException("Failed to delete family member");
        }
    }
}
