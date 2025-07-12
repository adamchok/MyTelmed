package com.mytelmed.core.reset.service;

import com.mytelmed.common.advice.AppException;
import com.mytelmed.common.constant.AccountType;
import com.mytelmed.core.auth.entity.Account;

public interface UserPasswordResetService {
    /**
     * Validates user credentials for password reset
     * @param email User's email
     * @param nric User's NRIC
     * @param userType Type of user (PATIENT, DOCTOR, PHARMACIST, ADMIN)
     * @return The user's account if validation passes
     * @throws AppException if validation fails
     */
    Account validateUserForPasswordReset(String email, String nric, AccountType userType) throws AppException;
} 