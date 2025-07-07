package com.mytelmed.core.appointment.repository;

import com.mytelmed.common.constant.appointment.AppointmentStatus;
import com.mytelmed.core.appointment.entity.Appointment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {
        Page<Appointment> findByPatientIdOrderByTimeSlotStartTimeDesc(UUID patientId, Pageable pageable);

        List<Appointment> findByPatientIdOrderByTimeSlotStartTimeDesc(UUID patientId);

        Page<Appointment> findByDoctorIdOrderByTimeSlotStartTimeDesc(UUID doctorId, Pageable pageable);

        List<Appointment> findByDoctorIdOrderByTimeSlotStartTimeDesc(UUID doctorId);

        @Query("SELECT a FROM Appointment a WHERE a.status = :status " +
                        "AND a.timeSlot.endTime > :startTime " +
                        "AND a.timeSlot.startTime <= :endTime " +
                        "ORDER BY a.timeSlot.endTime ASC")
        List<Appointment> findByStatusAndWithin(
                        @Param("status") AppointmentStatus status,
                        @Param("startTime") LocalDateTime startTime,
                        @Param("endTime") LocalDateTime endTime);

        @Query("SELECT a FROM Appointment a WHERE a.status = :status " +
                        "AND a.timeSlot.startTime BETWEEN :startWindow AND :endWindow " +
                        "ORDER BY a.timeSlot.startTime ASC")
        List<Appointment> findByStatusAndStartTimeBetween(
                        @Param("status") AppointmentStatus status,
                        @Param("startWindow") LocalDateTime startWindow,
                        @Param("endWindow") LocalDateTime endWindow);

        @Query("SELECT a FROM Appointment a WHERE a.status = :status " +
                        "AND a.timeSlot.endTime <= :cutoffTime " +
                        "ORDER BY a.timeSlot.endTime ASC")
        List<Appointment> findByStatusAndEndTimeBefore(
                        @Param("status") AppointmentStatus status,
                        @Param("cutoffTime") LocalDateTime cutoffTime);
}
