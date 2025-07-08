package com.mytelmed.core.family.strategy;

import com.mytelmed.common.constant.family.FamilyPermissionType;
import com.mytelmed.core.auth.entity.Account;
import java.util.UUID;

/**
 * Strategy interface for validating family member permissions
 */
public interface FamilyPermissionValidator {
    
    /**
     * Validates if the account has the required permission for the patient
     * 
     * @param account The account requesting access
     * @param patientId The patient ID
     * @param permissionType The required permission type
     * @return true if permission is granted, false otherwise
     */
    boolean hasPermission(Account account, UUID patientId, FamilyPermissionType permissionType);
    
    /**
     * Validates if the account is authorized to access patient data
     * Returns true if:
     * - Account is the patient themselves
     * - Account is a family member with the required permission
     * 
     * @param account The account requesting access
     * @param patientId The patient ID
     * @param permissionType The required permission type
     * @return true if access is authorized, false otherwise
     */
    boolean isAuthorizedForPatient(Account account, UUID patientId, FamilyPermissionType permissionType);
    
    /**
     * Gets the patient ID that the account is authorized to access
     * If the account is a patient, returns their own ID
     * If the account is a family member, returns the associated patient ID
     * 
     * @param account The account
     * @return Patient ID if authorized, null otherwise
     */
    UUID getAuthorizedPatientId(Account account);
} 