package com.mytelmed.repository;

import com.mytelmed.model.entity.Appointment;
import com.mytelmed.constant.AppointmentStatusType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {
    @Query("SELECT a FROM Appointment a WHERE " +
            "a.appointmentDateTime >= :startDate AND a.appointmentDateTime <= :endDate " +
            "ORDER BY a.appointmentDateTime ASC")
    Page<Appointment> findByDateRange(
            @Param("startDate") Instant startDate,
            @Param("endDate") Instant endDate,
            Pageable pageable);

    @Query("SELECT a FROM Appointment a WHERE a.doctor.id = :doctorId " +
           "AND a.appointmentDateTime >= :startDate AND a.appointmentDateTime <= :endDate " +
           "ORDER BY a.appointmentDateTime ASC")
    Page<Appointment> findByDoctorIdAndDateRange(
            @Param("doctorId") UUID doctorId,
            @Param("startDate") Instant startDate,
            @Param("endDate") Instant endDate,
            Pageable pageable);

    @Query("SELECT a FROM Appointment a WHERE a.patient.id = :patientId " +
           "AND a.appointmentDateTime >= :startDate AND a.appointmentDateTime <= :endDate " +
           "ORDER BY a.appointmentDateTime ASC")
    Page<Appointment> findByPatientIdAndDateRange(
            @Param("patientId") UUID patientId,
            @Param("startDate") Instant startDate,
            @Param("endDate") Instant endDate,
            Pageable pageable);

    @Query("SELECT COUNT(a) > 0 FROM Appointment a WHERE a.doctor.id = :doctorId " +
           "AND a.status NOT IN ('CANCELLED', 'COMPLETED', 'NO_SHOW') " +
           "AND ((a.appointmentDateTime <= :proposedEndTime) AND (a.appointmentEndDateTime >= :proposedStartTime))")
    boolean hasConflictingAppointmentForDoctor(
            @Param("doctorId") UUID doctorId,
            @Param("proposedStartTime") Instant proposedStartTime,
            @Param("proposedEndTime") Instant proposedEndTime);
}