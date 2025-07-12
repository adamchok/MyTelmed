package com.mytelmed.core.family.strategy.impl;

import com.mytelmed.common.constant.AccountType;
import com.mytelmed.common.constant.family.FamilyPermissionType;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.family.entity.FamilyMember;
import com.mytelmed.core.family.repository.FamilyMemberRepository;
import com.mytelmed.core.family.strategy.FamilyPermissionValidator;
import com.mytelmed.core.patient.entity.Patient;
import com.mytelmed.core.patient.repository.PatientRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
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
    public List<UUID> getAuthorizedPatientIds(Account account) {
        log.debug("Getting all authorized patient IDs for account {}", account.getId());

        List<UUID> authorizedPatientIds = new ArrayList<>();

        // If account is a patient, add their own ID
        if (account.getPermission().getType() == AccountType.PATIENT) {
            Patient patient = patientRepository.findByAccountId(account.getId()).orElse(null);
            if (patient != null) {
                authorizedPatientIds.add(patient.getId());
                log.debug("Account {} is a patient with ID {}", account.getId(), patient.getId());
            }
        }

        // If account is a family member, add all patients they can access
        List<FamilyMember> familyMembers = familyMemberRepository.findByMemberAccountId(account.getId());
        for (FamilyMember familyMember : familyMembers) {
            if (!familyMember.isPending()) {
                UUID patientId = familyMember.getPatient().getId();
                if (!authorizedPatientIds.contains(patientId)) {
                    authorizedPatientIds.add(patientId);
                    log.debug("Account {} is a family member of patient {}", account.getId(), patientId);
                }
            }
        }

        log.debug("Account {} has access to {} patient(s)", account.getId(), authorizedPatientIds.size());
        return authorizedPatientIds;
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
            boolean hasPermission = switch (permissionType) {
                case VIEW_MEDICAL_RECORDS, VIEW_REFERRALS -> familyMember.isCanViewMedicalRecords();
                case VIEW_APPOINTMENTS, JOIN_VIDEO_CALL -> familyMember.isCanViewAppointments();
                case MANAGE_APPOINTMENTS -> familyMember.isCanManageAppointments();
                case VIEW_PRESCRIPTIONS -> familyMember.isCanViewPrescriptions();
                case MANAGE_PRESCRIPTIONS -> familyMember.isCanManagePrescriptions();
                case VIEW_BILLING -> familyMember.isCanViewBilling();
                case MANAGE_BILLING -> familyMember.isCanManageBilling();
            };

            if (hasPermission) {
                log.debug("Family member {} has permission {} for patient {}",
                        familyMember.getId(), permissionType, patientId);
                return true;
            }
        }

        log.debug("Account {} does not have permission {} for patient {}",
                account.getId(), permissionType, patientId);
        return false;
    }
}
