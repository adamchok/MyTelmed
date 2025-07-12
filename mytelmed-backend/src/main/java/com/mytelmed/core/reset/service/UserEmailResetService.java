package com.mytelmed.core.reset.service;

import com.mytelmed.common.advice.AppException;
import com.mytelmed.common.constant.AccountType;
import com.mytelmed.core.auth.entity.Account;
import java.util.UUID;

public interface UserEmailResetService {
    /**
     * Validates user credentials for email reset
     * @param nric User's NRIC
     * @param phone User's phone number
     * @param serialNumber User's serial number (optional for non-patients)
     * @param name User's name
     * @param userType Type of user (PATIENT, DOCTOR, PHARMACIST, ADMIN)
     * @return The user's account if validation passes
     * @throws AppException if validation fails
     */
    Account validateUserForEmailReset(String nric, String phone, String serialNumber, String name, AccountType userType) throws AppException;

    /**
     * Resets email for a user by account ID
     * @param accountId The account ID
     * @param newEmail The new email address
     * @param userType Type of user (PATIENT, DOCTOR, PHARMACIST, ADMIN)
     * @throws AppException if reset fails
     */
    void resetEmailByAccountId(UUID accountId, String newEmail, AccountType userType) throws AppException;
} 