package com.mytelmed.core.family.service;

import com.mytelmed.common.advice.AppException;
import com.mytelmed.common.advice.exception.ResourceNotFoundException;
import com.mytelmed.common.constant.family.FamilyPermissionType;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.family.entity.FamilyMember;
import com.mytelmed.core.family.entity.FamilyMemberPermission;
import com.mytelmed.core.family.repository.FamilyMemberPermissionRepository;
import com.mytelmed.core.family.repository.FamilyMemberRepository;
import com.mytelmed.core.family.strategy.FamilyPermissionValidator;
import com.mytelmed.core.patient.entity.Patient;
import com.mytelmed.core.patient.service.PatientService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.UUID;


@Slf4j
@Service
public class FamilyMemberPermissionService {

    private final FamilyMemberPermissionRepository permissionRepository;
    private final FamilyMemberRepository familyMemberRepository;
    private final FamilyPermissionValidator permissionValidator;
    private final PatientService patientService;

    public FamilyMemberPermissionService(FamilyMemberPermissionRepository permissionRepository,
                                         FamilyMemberRepository familyMemberRepository,
                                         FamilyPermissionValidator permissionValidator,
                                         PatientService patientService) {
        this.permissionRepository = permissionRepository;
        this.familyMemberRepository = familyMemberRepository;
        this.permissionValidator = permissionValidator;
        this.patientService = patientService;
    }

    @Transactional
    public void grantPermissions(UUID patientAccountId, UUID familyMemberId, Set<FamilyPermissionType> permissions, LocalDate expiryDate) throws AppException {
        log.debug("Granting permissions {} to family member {} by patient {}", permissions, familyMemberId, patientAccountId);

        try {
            // Verify the patient owns this family member
            FamilyMember familyMember = familyMemberRepository.findById(familyMemberId)
                    .orElseThrow(() -> new ResourceNotFoundException("Family member not found"));

            Patient patient = patientService.findPatientByAccountId(patientAccountId);

            if (!familyMember.getPatient().getId().equals(patient.getId())) {
                throw new AppException("Unauthorized to manage this family member's permissions");
            }

            // Grant each permission
            for (FamilyPermissionType permissionType : permissions) {
                grantOrUpdateSinglePermission(familyMember, permissionType, true, expiryDate);
            }

            log.info("Successfully granted permissions {} to family member {}", permissions, familyMemberId);
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error granting permissions to family member {}", familyMemberId, e);
            throw new AppException("Failed to grant permissions");
        }
    }

    @Transactional
    public void revokePermissions(UUID patientAccountId, UUID familyMemberId, Set<FamilyPermissionType> permissions) throws AppException {
        log.debug("Revoking permissions {} from family member {} by patient {}", permissions, familyMemberId, patientAccountId);

        try {
            // Verify the patient owns this family member
            FamilyMember familyMember = familyMemberRepository.findById(familyMemberId)
                    .orElseThrow(() -> new ResourceNotFoundException("Family member not found"));

            Patient patient = patientService.findPatientByAccountId(patientAccountId);

            if (!familyMember.getPatient().getId().equals(patient.getId())) {
                throw new AppException("Unauthorized to manage this family member's permissions");
            }

            // Revoke each permission
            for (FamilyPermissionType permissionType : permissions) {
                grantOrUpdateSinglePermission(familyMember, permissionType, false, null);
            }

            log.info("Successfully revoked permissions {} from family member {}", permissions, familyMemberId);
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error revoking permissions from family member {}", familyMemberId, e);
            throw new AppException("Failed to revoke permissions");
        }
    }

    @Transactional
    public void updatePermissionExpiry(UUID patientAccountId, UUID familyMemberId, FamilyPermissionType permissionType, LocalDate newExpiryDate) throws AppException {
        log.debug("Updating expiry for permission {} of family member {} by patient {}", permissionType, familyMemberId, patientAccountId);

        try {
            // Verify the patient owns this family member
            FamilyMember familyMember = familyMemberRepository.findById(familyMemberId)
                    .orElseThrow(() -> new ResourceNotFoundException("Family member not found"));

            Patient patient = patientService.findPatientByAccountId(patientAccountId);

            if (!familyMember.getPatient().getId().equals(patient.getId())) {
                throw new AppException("Unauthorized to manage this family member's permissions");
            }

            // Find and update the permission
            FamilyMemberPermission permission = permissionRepository
                    .findByFamilyMemberIdAndPermissionType(familyMemberId, permissionType)
                    .orElseThrow(() -> new ResourceNotFoundException("Permission not found"));

            permission.setExpiryDate(newExpiryDate);
            permissionRepository.save(permission);

            log.info("Successfully updated expiry for permission {} of family member {}", permissionType, familyMemberId);
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error updating permission expiry for family member {}", familyMemberId, e);
            throw new AppException("Failed to update permission expiry");
        }
    }

    @Transactional(readOnly = true)
    public List<FamilyMemberPermission> getFamilyMemberPermissions(UUID familyMemberId) {
        log.debug("Getting permissions for family member {}", familyMemberId);
        return permissionRepository.findByFamilyMemberId(familyMemberId);
    }

    @Transactional(readOnly = true)
    public boolean hasPermission(Account account, UUID patientId, FamilyPermissionType permissionType) {
        return permissionValidator.hasPermission(account, patientId, permissionType);
    }

    @Transactional(readOnly = true)
    public boolean isAuthorizedForPatient(Account account, UUID patientId, FamilyPermissionType permissionType) {
        return permissionValidator.isAuthorizedForPatient(account, patientId, permissionType);
    }

    @Transactional(readOnly = true)
    public UUID getAuthorizedPatientId(Account account) {
        return permissionValidator.getAuthorizedPatientId(account);
    }

    @Transactional
    public void cleanupExpiredPermissions() {
        log.debug("Cleaning up expired permissions");

        try {
            List<FamilyMemberPermission> expiredPermissions = permissionRepository.findExpiredPermissions(LocalDate.now());

            for (FamilyMemberPermission permission : expiredPermissions) {
                permission.setGranted(false);
                permission.setNotes("Automatically revoked due to expiry");
            }

            permissionRepository.saveAll(expiredPermissions);
            log.info("Cleaned up {} expired permissions", expiredPermissions.size());
        } catch (Exception e) {
            log.error("Error cleaning up expired permissions", e);
            throw new AppException("Failed to cleanup expired permissions");
        }
    }

    private void grantOrUpdateSinglePermission(FamilyMember familyMember, FamilyPermissionType permissionType, boolean isGranted, LocalDate expiryDate) {
        FamilyMemberPermission permission = permissionRepository
                .findByFamilyMemberIdAndPermissionType(familyMember.getId(), permissionType)
                .orElse(FamilyMemberPermission.builder()
                        .familyMember(familyMember)
                        .permissionType(permissionType)
                        .build());

        permission.setGranted(isGranted);
        permission.setExpiryDate(expiryDate);

        permissionRepository.save(permission);
    }
}
