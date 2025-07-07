package com.mytelmed.core.payment.entity;

import com.mytelmed.common.constant.payment.PaymentMode;
import com.mytelmed.core.patient.entity.Patient;
import jakarta.persistence.Column;
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
@Table(name = "payment_transaction")
public class PaymentTransaction {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(name = "transaction_number", nullable = false, unique = true)
  private String transactionNumber;

  @ManyToOne
  @JoinColumn(name = "bill_id", nullable = false)
  private Bill bill;

  @ManyToOne
  @JoinColumn(name = "patient_id", nullable = false)
  private Patient patient;

  @Column(name = "amount", nullable = false, precision = 10, scale = 2)
  private BigDecimal amount;

  @Enumerated(EnumType.STRING)
  @Column(name = "payment_mode", nullable = false)
  private PaymentMode paymentMode;

  @Enumerated(EnumType.STRING)
  @Column(name = "status", nullable = false)
  private TransactionStatus status;

  @Column(name = "stripe_payment_intent_id")
  private String stripePaymentIntentId;

  @Column(name = "stripe_charge_id")
  private String stripeChargeId;

  @Column(name = "stripe_payment_method_id")
  private String stripePaymentMethodId;

  @Column(name = "stripe_customer_id")
  private String stripeCustomerId;

  @Column(name = "currency", length = 3)
  @Builder.Default
  private String currency = "USD";

  @Column(name = "failure_reason")
  private String failureReason;

  @Column(name = "processed_at")
  private Instant processedAt;

  @CreationTimestamp
  @Column(name = "created_at", nullable = false)
  private Instant createdAt;

  @UpdateTimestamp
  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt;

  public enum TransactionStatus {
    PENDING,
    PROCESSING,
    COMPLETED,
    FAILED,
    CANCELLED,
    REFUNDED
  }
}
