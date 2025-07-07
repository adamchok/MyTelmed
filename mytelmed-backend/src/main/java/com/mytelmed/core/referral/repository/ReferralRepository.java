package com.mytelmed.core.referral.repository;

import com.mytelmed.common.constant.referral.ReferralStatus;
import com.mytelmed.core.doctor.entity.Doctor;
import com.mytelmed.core.patient.entity.Patient;
import com.mytelmed.core.referral.entity.Referral;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;


@Repository
public interface ReferralRepository extends JpaRepository<Referral, UUID> {
    Optional<Referral> findByReferralNumber(String referralNumber);

    Page<Referral> findByPatientOrderByCreatedAtDesc(Patient patient, Pageable pageable);

    Page<Referral> findByReferringDoctorOrderByCreatedAtDesc(Doctor referringDoctor, Pageable pageable);

    Page<Referral> findByReferredDoctorOrderByCreatedAtDesc(Doctor referredDoctor, Pageable pageable);

    @Query("SELECT r FROM Referral r WHERE r.expiryDate < :today AND r.status = 'PENDING'")
    List<Referral> findExpiredReferrals(@Param("today") LocalDate today);

    @Query("SELECT r FROM Referral r WHERE r.referredDoctor = :doctor AND r.status = 'PENDING' ORDER BY r.priority DESC, r.createdAt ASC")
    List<Referral> findPendingReferralsForDoctor(@Param("doctor") Doctor doctor);
    
    @Query("SELECT COUNT(r) FROM Referral r WHERE r.referredDoctor = :doctor AND r.status = :status")
    long countByReferredDoctorAndStatus(@Param("doctor") Doctor doctor, @Param("status") ReferralStatus status);
}
