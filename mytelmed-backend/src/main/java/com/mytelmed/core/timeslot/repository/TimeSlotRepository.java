package com.mytelmed.core.timeslot.repository;

import com.mytelmed.core.timeslot.entity.TimeSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface TimeSlotRepository extends JpaRepository<TimeSlot, UUID> {
        @Query("SELECT ts FROM TimeSlot ts WHERE ts.doctor.id = :doctorId " +
                        "AND ts.startTime >= :startTime AND ts.endTime <= :endTime " +
                        "AND ts.isAvailable = true AND ts.isBooked = false " +
                        "ORDER BY ts.startTime ASC")
        List<TimeSlot> findAvailableSlotsByDoctorId(
                        @Param("doctorId") UUID doctorId,
                        @Param("startTime") LocalDateTime startTime,
                        @Param("endTime") LocalDateTime endTime);

        @Query("SELECT ts FROM TimeSlot ts WHERE ts.doctor.id = :doctorId " +
                        "AND ts.startTime >= :fromDate " +
                        "ORDER BY ts.startTime ASC")
        List<TimeSlot> findSlotsByDoctorId(
                        @Param("doctorId") UUID doctorId,
                        @Param("fromDate") LocalDateTime fromDate);

        @Query("SELECT COUNT(ts) > 0 FROM TimeSlot ts WHERE ts.doctor.id = :doctorId " +
                        "AND ts.startTime < :endTime " +
                        "AND ts.endTime > :startTime")
        boolean hasOverlappingTimeSlots(
                        @Param("doctorId") UUID doctorId,
                        @Param("startTime") LocalDateTime startTime,
                        @Param("endTime") LocalDateTime endTime);

        @Query("SELECT COUNT(ts) > 0 FROM TimeSlot ts WHERE ts.doctor.id = :doctorId " +
                        "AND ts.id != :excludeTimeSlotId " +
                        "AND ts.startTime < :endTime " +
                        "AND ts.endTime > :startTime")
        boolean hasOverlappingTimeSlotsExcluding(
                        @Param("doctorId") UUID doctorId,
                        @Param("startTime") LocalDateTime startTime,
                        @Param("endTime") LocalDateTime endTime,
                        @Param("excludeTimeSlotId") UUID excludeTimeSlotId);
}
