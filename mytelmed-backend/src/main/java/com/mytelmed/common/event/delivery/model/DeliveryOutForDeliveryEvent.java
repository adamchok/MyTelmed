package com.mytelmed.common.event.delivery.model;

import com.mytelmed.core.delivery.entity.MedicationDelivery;

/**
 * Event fired when a medication delivery is marked as out for delivery.
 */
public record DeliveryOutForDeliveryEvent(MedicationDelivery delivery) {
}