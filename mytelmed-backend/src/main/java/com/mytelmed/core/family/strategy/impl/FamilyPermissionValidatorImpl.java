package com.mytelmed.core.family.strategy.impl;

import com.mytelmed.common.constant.AccountType;
import com.mytelmed.common.constant.family.FamilyPermissionType;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.family.entity.FamilyMember;
import com.mytelmed.core.family.entity.FamilyMemberPermission;
import com.mytelmed.core.family.repository.FamilyMemberRepository;
import com.mytelmed.core.family.strategy.FamilyPermissionValidator;
import com.mytelmed.core.patient.entity.Patient;
import com.mytelmed.core.patient.repository.PatientRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
public class FamilyPermissionValidatorImpl implements FamilyPermissionValidator {
    
    private final FamilyMemberRepository familyMemberRepository;
    private final PatientRepository patientRepository;

    public FamilyPermissionValidatorImpl(FamilyMemberRepository familyMemberRepository, 
                                       PatientRepository patientRepository) {
        this.familyMemberRepository = familyMemberRepository;
        this.patientRepository = patientRepository;
    }

    @Override
    public boolean hasPermission(Account account, UUID patientId, FamilyPermissionType permissionType) {
        log.debug("Checking permission {} for account {} on patient {}", 
                 permissionType, account.getId(), patientId);

        // If account is the patient themselves, they have all permissions
        if (isPatientAccount(account, patientId)) {
            log.debug("Account {} is the patient themselves", account.getId());
            return true;
        }

        // Check if account is a family member with the required permission
        return isFamilyMemberWithPermission(account, patientId, permissionType);
    }

    @Override
    public boolean isAuthorizedForPatient(Account account, UUID patientId, FamilyPermissionType permissionType) {
        log.debug("Checking authorization for account {} to access patient {} with permission {}", 
                 account.getId(), patientId, permissionType);

        return hasPermission(account, patientId, permissionType);
    }

    @Override
    public UUID getAuthorizedPatientId(Account account) {
        log.debug("Getting authorized patient ID for account {}", account.getId());

        // If account is a patient, return their own ID
        if (account.getPermission().getType() == AccountType.PATIENT) {
            Optional<Patient> patient = patientRepository.findByAccountId(account.getId());
            if (patient.isPresent()) {
                log.debug("Account {} is patient with ID {}", account.getId(), patient.get().getId());
                return patient.get().getId();
            }
        }

        // Check if account is a family member
        List<FamilyMember> familyMembers = familyMemberRepository.findByMemberAccountId(account.getId());
        if (!familyMembers.isEmpty()) {
            // For now, return the first patient they're associated with
            // In the future, this could be enhanced to handle multiple patient associations
            FamilyMember familyMember = familyMembers.get(0);
            log.debug("Account {} is family member for patient {}", 
                     account.getId(), familyMember.getPatient().getId());
            return familyMember.getPatient().getId();
        }

        log.debug("Account {} is not authorized for any patient", account.getId());
        return null;
    }

    private boolean isPatientAccount(Account account, UUID patientId) {
        if (account.getPermission().getType() != AccountType.PATIENT) {
            return false;
        }

        return patientRepository.findByAccountId(account.getId())
                .map(patient -> patient.getId().equals(patientId))
                .orElse(false);
    }

    private boolean isFamilyMemberWithPermission(Account account, UUID patientId, FamilyPermissionType permissionType) {
        List<FamilyMember> familyMembers = familyMemberRepository.findByMemberAccountIdAndPatientId(
                account.getId(), patientId);

        for (FamilyMember familyMember : familyMembers) {
            if (familyMember.isPending()) {
                log.debug("Family member {} is still pending", familyMember.getId());
                continue;
            }

            // Check if family member has the required permission
            for (FamilyMemberPermission permission : familyMember.getPermissions()) {
                if (permission.getPermissionType() == permissionType && permission.isActive()) {
                    log.debug("Family member {} has active permission {} for patient {}", 
                             familyMember.getId(), permissionType, patientId);
                    return true;
                }
            }
        }

        log.debug("Account {} does not have permission {} for patient {}", 
                 account.getId(), permissionType, patientId);
        return false;
    }
}
