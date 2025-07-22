package com.mytelmed.core.payment.entity;

import com.mytelmed.common.constant.payment.BillType;
import com.mytelmed.common.constant.payment.BillingStatus;
import com.mytelmed.common.constant.payment.PaymentMode;
import com.mytelmed.common.utils.conveter.EncryptionConverter;
import com.mytelmed.core.patient.entity.Patient;
import com.mytelmed.core.appointment.entity.Appointment;
import com.mytelmed.core.prescription.entity.Prescription;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "bill")
public class Bill {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "bill_number", nullable = false, unique = true)
    private String billNumber;

    @Column(name = "amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Enumerated(EnumType.STRING)
    @Column(name = "bill_type", nullable = false)
    private BillType billType;

    @Enumerated(EnumType.STRING)
    @Column(name = "billing_status", nullable = false)
    private BillingStatus billingStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_mode")
    private PaymentMode paymentMode;

    // Optional references to related entities
    @ManyToOne
    @JoinColumn(name = "appointment_id")
    private Appointment appointment;

    @ManyToOne
    @JoinColumn(name = "prescription_id")
    private Prescription prescription;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "stripe_payment_intent_id")
    private String stripePaymentIntentId;

    @Column(name = "stripe_charge_id")
    private String stripeChargeId;

    @Convert(converter = EncryptionConverter.class)
    @Column(name = "receipt_url", columnDefinition = "TEXT")
    private String receiptUrl;

    // Refund tracking fields
    @Column(name = "refund_amount", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal refundAmount = BigDecimal.ZERO;

    @Column(name = "stripe_refund_id")
    private String stripeRefundId;

    @Enumerated(EnumType.STRING)
    @Column(name = "refund_status")
    private RefundStatus refundStatus;

    @Column(name = "refund_reason")
    private String refundReason;

    @Column(name = "refunded_at")
    private Instant refundedAt;

    @Column(name = "billed_at", nullable = false)
    private Instant billedAt;

    @Column(name = "paid_at")
    private Instant paidAt;

    @Column(name = "cancelled_at")
    private Instant cancelledAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public enum RefundStatus {
        NOT_REFUNDED,
        REFUND_PENDING,
        REFUND_PROCESSING,
        REFUNDED,
        REFUND_FAILED,
        PARTIAL_REFUND
    }

    /**
     * Checks if this bill is eligible for a full refund
     */
    public boolean isEligibleForFullRefund() {
        return billingStatus == BillingStatus.PAID // Must be paid (not refunded, cancelled, or unpaid)
                && (refundStatus == null || refundStatus == RefundStatus.NOT_REFUNDED)
                && refundAmount.compareTo(BigDecimal.ZERO) == 0;
    }

    /**
     * Checks if this bill has been fully refunded
     */
    public boolean isFullyRefunded() {
        return refundStatus == RefundStatus.REFUNDED
                && refundAmount.compareTo(amount) == 0;
    }

    /**
     * Gets the remaining refundable amount
     */
    public BigDecimal getRefundableAmount() {
        if (billingStatus != BillingStatus.PAID || billingStatus == BillingStatus.REFUNDED) {
            return BigDecimal.ZERO;
        }
        return amount.subtract(refundAmount);
    }
}
