package com.mytelmed.common.event.delivery.model;

import com.mytelmed.core.delivery.entity.MedicationDelivery;

public record DeliveryProcessingStartedEvent(MedicationDelivery delivery) {
} 