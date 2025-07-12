package com.mytelmed.core.family.service;

import com.mytelmed.common.constant.family.FamilyPermissionType;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.family.strategy.FamilyPermissionValidator;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;


@Slf4j
@Service
public class FamilyMemberPermissionService {
    private final FamilyPermissionValidator familyPermissionValidator;

    public FamilyMemberPermissionService(FamilyPermissionValidator familyPermissionValidator) {
        this.familyPermissionValidator = familyPermissionValidator;
    }

    /**
     * Check if the account has permission to access the patient's data
     *
     * @param account        the account requesting access
     * @param patientId      the patient ID
     * @param permissionType the type of permission required
     * @return true if permission is granted, false otherwise
     */
    public boolean hasPermission(Account account, UUID patientId, FamilyPermissionType permissionType) {
        log.debug("Checking permission {} for account {} on patient {}", permissionType, account.getId(), patientId);
        return familyPermissionValidator.hasPermission(account, patientId, permissionType);
    }

    /**
     * Check if the account is authorized to access the patient's data
     *
     * @param account        the account requesting access
     * @param patientId      the patient ID
     * @param permissionType the type of permission required
     * @return true if authorized, false otherwise
     */
    public boolean isAuthorizedForPatient(Account account, UUID patientId, FamilyPermissionType permissionType) {
        log.debug("Checking authorization for account {} to access patient {} with permission {}",
                account.getId(), patientId, permissionType);
        return familyPermissionValidator.isAuthorizedForPatient(account, patientId, permissionType);
    }

    /**
     * Get all patient IDs that the account is authorized to access
     *
     * @param account the account
     * @return list of patient IDs the account can access (empty list if none)
     */
    public List<UUID> getAuthorizedPatientIds(Account account) {
        log.debug("Getting all authorized patient IDs for account {}", account.getId());
        return familyPermissionValidator.getAuthorizedPatientIds(account);
    }
}
