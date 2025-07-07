package com.mytelmed.core.payment.repository;

import com.mytelmed.core.payment.entity.PaymentTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, UUID> {

  Optional<PaymentTransaction> findByTransactionNumber(String transactionNumber);

  Optional<PaymentTransaction> findByStripePaymentIntentId(String stripePaymentIntentId);

  Page<PaymentTransaction> findByPatientId(UUID patientId, Pageable pageable);

  Page<PaymentTransaction> findByBillId(UUID billId, Pageable pageable);

  List<PaymentTransaction> findByStatus(PaymentTransaction.TransactionStatus status);

  @Query("SELECT pt FROM PaymentTransaction pt WHERE pt.status = :status AND pt.createdAt BETWEEN :startDate AND :endDate")
  List<PaymentTransaction> findByStatusAndDateRange(
      @Param("status") PaymentTransaction.TransactionStatus status,
      @Param("startDate") Instant startDate,
      @Param("endDate") Instant endDate);

  @Query("SELECT COUNT(pt) FROM PaymentTransaction pt WHERE pt.patient.id = :patientId AND pt.status IN :statuses")
  long countByPatientIdAndStatuses(
      @Param("patientId") UUID patientId,
      @Param("statuses") List<PaymentTransaction.TransactionStatus> statuses);
}