package com.mytelmed.common.event.delivery.model;

import com.mytelmed.core.delivery.entity.MedicationDelivery;

/**
 * Event fired when a medication delivery is completed (delivered or picked up).
 */
public record DeliveryCompletedEvent(MedicationDelivery delivery) {
}