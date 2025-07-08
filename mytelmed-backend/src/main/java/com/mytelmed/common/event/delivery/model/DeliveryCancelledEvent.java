package com.mytelmed.common.event.delivery.model;

import com.mytelmed.core.delivery.entity.MedicationDelivery;

/**
 * Event fired when a medication delivery is cancelled.
 */
public record DeliveryCancelledEvent(MedicationDelivery delivery, String reason) {
}