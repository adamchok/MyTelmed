package com.mytelmed.common.constant.delivery;

/**
 * Available delivery methods for medication in Malaysian public healthcare
 * telemedicine.
 */
public enum DeliveryMethod {
  /**
   * Patient picks up medication from pharmacy/facility
   */
  PICKUP,

  /**
   * Medication delivered to patient's address via courier service
   * Standard delivery time: 1-3 business days
   */
  HOME_DELIVERY
}