package com.mytelmed.common.constant.delivery;

/**
 * Delivery status for medication delivery tracking in Malaysian public
 * healthcare system.
 * Follows standard 1-3 business days delivery timeline.
 */
public enum DeliveryStatus {
  /**
   * Patient has chosen delivery and payment is pending
   */
  PENDING_PAYMENT,

  /**
   * Payment completed, ready for pharmacy processing
   */
  PAID,

  /**
   * Pharmacy is preparing medication
   */
  PREPARING,

  /**
   * Medication is ready for pickup by patient
   */
  READY_FOR_PICKUP,

  /**
   * Medication handed over to delivery service
   */
  OUT_FOR_DELIVERY,

  /**
   * Successfully delivered to patient
   */
  DELIVERED,

  /**
   * Delivery failed or cancelled
   */
  CANCELLED
}