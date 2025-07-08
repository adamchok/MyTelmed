package com.mytelmed.core.payment.strategy;

import com.mytelmed.common.advice.AppException;
import com.mytelmed.core.auth.entity.Account;
import java.util.UUID;

/**
 * Strategy interface for validating payment requirements and permissions.
 * Provides flexibility for different payment scenarios in the telemedicine
 * system.
 */
public interface PaymentValidationStrategy {

  /**
   * Validates if payment is required for the given entity
   * (appointment/prescription)
   * 
   * @param entityId The ID of the entity (appointment or prescription)
   * @return true if payment is required, false otherwise
   * @throws AppException if validation fails
   */
  boolean isPaymentRequired(UUID entityId) throws AppException;

  /**
   * Validates if the account is authorized to make payment for the given entity
   * 
   * @param account  The account requesting to make payment
   * @param entityId The ID of the entity to pay for
   * @return true if authorized, false otherwise
   * @throws AppException if validation fails
   */
  boolean isAuthorizedToPayFor(Account account, UUID entityId) throws AppException;

  /**
   * Gets the patient ID associated with the entity
   * 
   * @param entityId The ID of the entity
   * @return The patient ID
   * @throws AppException if entity not found or access denied
   */
  UUID getPatientIdForEntity(UUID entityId) throws AppException;

  /**
   * Validates the payment amount for the entity
   * 
   * @param entityId The ID of the entity
   * @return The expected payment amount
   * @throws AppException if validation fails
   */
  java.math.BigDecimal getExpectedPaymentAmount(UUID entityId) throws AppException;
}