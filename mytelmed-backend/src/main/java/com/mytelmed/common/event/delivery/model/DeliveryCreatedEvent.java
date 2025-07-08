package com.mytelmed.common.event.delivery.model;

import com.mytelmed.core.delivery.entity.MedicationDelivery;

/**
 * Event fired when a medication delivery is created (patient chooses delivery
 * method).
 */
public record DeliveryCreatedEvent(MedicationDelivery delivery) {
}