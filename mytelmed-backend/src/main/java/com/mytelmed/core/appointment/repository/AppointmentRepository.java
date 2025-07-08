package com.mytelmed.core.appointment.repository;

import com.mytelmed.common.constant.appointment.AppointmentStatus;
import com.mytelmed.common.constant.appointment.ConsultationMode;
import com.mytelmed.core.appointment.entity.Appointment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.Instant;
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

        /**
         * Find appointments by status and time slot start time before threshold
         * (for auto-confirmation)
         */
        @Query("SELECT a FROM Appointment a WHERE a.status = :status " +
                        "AND a.timeSlot.startTime <= :threshold " +
                        "ORDER BY a.timeSlot.startTime ASC")
        List<Appointment> findByStatusAndTimeSlotStartTimeBefore(
                        @Param("status") AppointmentStatus status,
                        @Param("threshold") LocalDateTime threshold);

        /**
         * Find appointments by status, consultation mode, and time slot start time
         * before a threshold
         */
        @Query("SELECT a FROM Appointment a WHERE a.status = :status " +
                        "AND a.consultationMode = :consultationMode " +
                        "AND a.timeSlot.startTime <= :threshold " +
                        "ORDER BY a.timeSlot.startTime ASC")
        List<Appointment> findByStatusAndConsultationModeAndTimeSlotStartTimeBefore(
                        @Param("status") AppointmentStatus status,
                        @Param("consultationMode") ConsultationMode consultationMode,
                        @Param("threshold") LocalDateTime threshold);

        /**
         * Find appointments by status and created at before a threshold (for unpaid
         * cancellation)
         */
        @Query("SELECT a FROM Appointment a WHERE a.status = :status " +
                        "AND a.createdAt <= :threshold " +
                        "ORDER BY a.createdAt ASC")
        List<Appointment> findByStatusAndCreatedAtBefore(
                        @Param("status") AppointmentStatus status,
                        @Param("threshold") Instant threshold);

        /**
         * Find appointments by status and updated at before a threshold (for timeout
         * handling)
         */
        @Query("SELECT a FROM Appointment a WHERE a.status = :status " +
                        "AND a.consultationMode = :consultationMode " +
                        "AND a.updatedAt <= :threshold " +
                        "ORDER BY a.updatedAt ASC")
        List<Appointment> findByStatusAndConsultationModeAndUpdatedAtBefore(
                        @Param("status") AppointmentStatus status,
                        @Param("consultationMode") ConsultationMode consultationMode,
                        @Param("threshold") Instant threshold);

        /**
         * Find appointments by status list and time slot start time before threshold
         * (for no-show)
         */
        @Query("SELECT a FROM Appointment a WHERE a.status IN :statusList " +
                        "AND a.timeSlot.startTime <= :threshold " +
                        "ORDER BY a.timeSlot.startTime ASC")
        List<Appointment> findByStatusInAndTimeSlotStartTimeBefore(
                        @Param("statusList") List<AppointmentStatus> statusList,
                        @Param("threshold") LocalDateTime threshold);

        /**
         * Find upcoming appointments for reminder within time window
         */
        @Query("SELECT a FROM Appointment a WHERE a.status IN ('PENDING', 'CONFIRMED', 'READY_FOR_CALL') " +
                        "AND a.timeSlot.startTime BETWEEN :startTime AND :endTime " +
                        "ORDER BY a.timeSlot.startTime ASC")
        List<Appointment> findUpcomingAppointmentsForReminder(
                        @Param("startTime") LocalDateTime startTime,
                        @Param("endTime") LocalDateTime endTime);

        /**
         * Find virtual appointments for 1-hour reminders
         */
        @Query("SELECT a FROM Appointment a WHERE a.status IN :statusList " +
                        "AND a.consultationMode = :consultationMode " +
                        "AND a.timeSlot.startTime BETWEEN :startTime AND :endTime " +
                        "ORDER BY a.timeSlot.startTime ASC")
        List<Appointment> findByStatusInAndConsultationModeAndTimeSlotStartTimeBetween(
                        @Param("statusList") List<AppointmentStatus> statusList,
                        @Param("consultationMode") ConsultationMode consultationMode,
                        @Param("startTime") LocalDateTime startTime,
                        @Param("endTime") LocalDateTime endTime);

        /**
         * Count appointments by status list and updated at before threshold (for
         * cleanup)
         */
        @Query("SELECT COUNT(a) FROM Appointment a WHERE a.status IN :statusList " +
                        "AND a.updatedAt <= :threshold")
        long countByStatusInAndUpdatedAtBefore(
                        @Param("statusList") List<AppointmentStatus> statusList,
                        @Param("threshold") Instant threshold);

        /**
         * Find appointments by status and updated at before threshold (for stuck
         * appointment detection)
         */
        @Query("SELECT a FROM Appointment a WHERE a.status = :status " +
                        "AND a.updatedAt <= :threshold " +
                        "ORDER BY a.updatedAt ASC")
        List<Appointment> findByStatusAndUpdatedAtBefore(
                        @Param("status") AppointmentStatus status,
                        @Param("threshold") Instant threshold);
}
