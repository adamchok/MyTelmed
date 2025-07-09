package com.mytelmed.core.delivery.entity;

import com.mytelmed.common.constant.delivery.DeliveryMethod;
import com.mytelmed.common.constant.delivery.DeliveryStatus;
import com.mytelmed.core.address.entity.Address;
import com.mytelmed.core.prescription.entity.Prescription;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

/**
 * Medication delivery entity for tracking delivery logistics in Malaysian
 * public healthcare telemedicine.
 * Handles pickup and home delivery workflows with standard 1-3 business days
 * delivery timeline.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "medication_delivery")
public class MedicationDelivery {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(optional = false)
    @JoinColumn(name = "prescription_id", nullable = false, unique = true)
    private Prescription prescription;

    @Enumerated(EnumType.STRING)
    @Column(name = "delivery_method", nullable = false)
    private DeliveryMethod deliveryMethod;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private DeliveryStatus status = DeliveryStatus.PENDING_PAYMENT;

    @ManyToOne
    @JoinColumn(name = "delivery_address_id")
    private Address deliveryAddress;

    @Column(name = "delivery_fee", precision = 10, scale = 2)
    private BigDecimal deliveryFee;

    @Column(name = "delivery_instructions", columnDefinition = "TEXT")
    private String deliveryInstructions;

    @Column(name = "estimated_delivery_date")
    private Instant estimatedDeliveryDate;

    @Column(name = "actual_delivery_date")
    private Instant actualDeliveryDate;

    @Column(name = "pickup_date")
    private Instant pickupDate;

    @Column(name = "tracking_reference")
    private String trackingReference;

    @Column(name = "courier_name")
    private String courierName;

    @Column(name = "delivery_contact_phone")
    private String deliveryContactPhone;

    @Column(name = "delivery_notes", columnDefinition = "TEXT")
    private String deliveryNotes;

    @Column(name = "cancellation_reason", columnDefinition = "TEXT")
    private String cancellationReason;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    /**
     * Calculates estimated delivery date based on Malaysian standard: 1-3 business
     * days
     */
    public void calculateEstimatedDeliveryDate() {
        if (deliveryMethod == DeliveryMethod.HOME_DELIVERY) {
            // Standard 2 business days for Malaysian public healthcare delivery
            this.estimatedDeliveryDate = Instant.now().plus(2, ChronoUnit.DAYS);
        }
    }

    /**
     * Checks if delivery is for home delivery
     */
    public boolean isHomeDelivery() {
        return deliveryMethod == DeliveryMethod.HOME_DELIVERY;
    }

    /**
     * Checks if delivery is for pickup
     */
    public boolean isPickup() {
        return deliveryMethod == DeliveryMethod.PICKUP;
    }

    /**
     * Checks if delivery is completed (either delivered or picked up)
     */
    public boolean isCompleted() {
        return status == DeliveryStatus.DELIVERED ||
                (isPickup() && pickupDate != null);
    }
}
