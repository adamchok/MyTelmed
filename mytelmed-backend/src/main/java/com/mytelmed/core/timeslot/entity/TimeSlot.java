package com.mytelmed.core.timeslot.entity;

import com.mytelmed.common.constant.appointment.ConsultationMode;
import com.mytelmed.core.doctor.entity.Doctor;
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
import jakarta.persistence.Version;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * TimeSlot entity for Malaysian public healthcare telemedicine system.
 * Doctors can specify whether a time slot is available for PHYSICAL or VIRTUAL
 * consultations.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "time_slot")
public class TimeSlot {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Version
    private Long version;

    @ManyToOne(optional = false)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @Column(name = "duration", nullable = false)
    private Integer durationMinutes;

    @Enumerated(EnumType.STRING)
    @Column(name = "consultation_mode", nullable = false)
    private ConsultationMode consultationMode;

    @Column(name = "available", nullable = false)
    private Boolean isAvailable;

    @Column(name = "booked", nullable = false)
    private Boolean isBooked;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    /**
     * Checks if this time slot supports virtual consultations
     */
    public boolean supportsVirtualConsultation() {
        return consultationMode == ConsultationMode.VIRTUAL;
    }

    /**
     * Checks if this time slot supports physical consultations
     */
    public boolean supportsPhysicalConsultation() {
        return consultationMode == ConsultationMode.PHYSICAL;
    }

    /**
     * Checks if this time slot is available for booking
     */
    public boolean isAvailableForBooking() {
        return isAvailable && !isBooked;
    }

    /**
     * Checks if this time slot supports the specified consultation mode
     */
    public boolean supportsConsultationMode(ConsultationMode mode) {
        return this.consultationMode == mode;
    }
}
