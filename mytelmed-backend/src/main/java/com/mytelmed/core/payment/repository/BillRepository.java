package com.mytelmed.core.payment.repository;

import com.mytelmed.common.constant.payment.BillType;
import com.mytelmed.common.constant.payment.BillingStatus;
import com.mytelmed.core.payment.entity.Bill;
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
public interface BillRepository extends JpaRepository<Bill, UUID> {

  Optional<Bill> findByBillNumber(String billNumber);

  Page<Bill> findByPatientId(UUID patientId, Pageable pageable);

  Page<Bill> findByPatientIdAndBillingStatus(UUID patientId, BillingStatus status, Pageable pageable);

  Page<Bill> findByBillType(BillType billType, Pageable pageable);

  List<Bill> findByBillingStatus(BillingStatus status);

  Optional<Bill> findByAppointmentId(UUID appointmentId);

  Optional<Bill> findByPrescriptionId(UUID prescriptionId);

  @Query("SELECT b FROM Bill b WHERE b.billingStatus = :status AND b.billedAt BETWEEN :startDate AND :endDate")
  List<Bill> findByStatusAndDateRange(
      @Param("status") BillingStatus status,
      @Param("startDate") Instant startDate,
      @Param("endDate") Instant endDate);

  @Query("SELECT COUNT(b) FROM Bill b WHERE b.patient.id = :patientId AND b.billingStatus = 'UNPAID'")
  long countUnpaidBillsByPatient(@Param("patientId") UUID patientId);
}