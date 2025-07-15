package com.mytelmed.core.prescription.repository;

import com.mytelmed.common.constant.prescription.PrescriptionStatus;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.prescription.entity.Prescription;
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
public interface PrescriptionRepository extends JpaRepository<Prescription, UUID> {

    Optional<Prescription> findByPrescriptionNumber(String prescriptionNumber);

    Page<Prescription> findByPatientId(UUID patientId, Pageable pageable);

    Page<Prescription> findByPatientAccount(Account patientAccount, Pageable pageable);

    Page<Prescription> findByDoctorAccount(Account doctorAccount, Pageable pageable);

    Page<Prescription> findByDoctorId(UUID doctorId, Pageable pageable);

    Page<Prescription> findByFacilityId(UUID facilityId, Pageable pageable);

    Page<Prescription> findByFacilityIdAndStatus(UUID facilityId, PrescriptionStatus status, Pageable pageable);

    Page<Prescription> findByPharmacistId(UUID pharmacistId, Pageable pageable);

    Page<Prescription> findByStatus(PrescriptionStatus status, Pageable pageable);

    @Query("SELECT p FROM Prescription p WHERE p.expiryDate < :currentTime AND p.status NOT IN ('DELIVERED', 'PICKED_UP', 'CANCELLED')")
    List<Prescription> findExpiredPrescriptions(@Param("currentTime") Instant currentTime);

    @Query("SELECT p FROM Prescription p WHERE p.facility.id = :facilityId AND p.prescriptionNumber = :prescriptionNumber")
    Optional<Prescription> findByFacilityIdAndPrescriptionNumber(@Param("facilityId") UUID facilityId,
            @Param("prescriptionNumber") String prescriptionNumber);

    boolean existsByAppointmentId(UUID appointmentId);
}
