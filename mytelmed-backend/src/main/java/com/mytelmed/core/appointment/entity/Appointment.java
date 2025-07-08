package com.mytelmed.core.appointment.entity;

import com.mytelmed.common.constant.appointment.AppointmentStatus;
import com.mytelmed.common.constant.appointment.ConsultationMode;
import com.mytelmed.core.doctor.entity.Doctor;
import com.mytelmed.core.patient.entity.Patient;
import com.mytelmed.core.timeslot.entity.TimeSlot;
import com.mytelmed.core.videocall.entity.VideoCall;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
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
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Appointment entity for Malaysian public healthcare telemedicine system.
 * Supports both PHYSICAL and VIRTUAL consultation modes.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "appointment")
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Version
    private Long version;

    @ManyToOne(optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(optional = false)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @ManyToOne(optional = false, cascade = CascadeType.ALL)
    @JoinColumn(name = "time_slot_id", nullable = false)
    private TimeSlot timeSlot;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private AppointmentStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "consultation_mode", nullable = false)
    private ConsultationMode consultationMode;

    @Column(name = "patient_notes", columnDefinition = "TEXT")
    private String patientNotes;

    @Column(name = "doctor_notes", columnDefinition = "TEXT")
    private String doctorNotes;

    @Column(name = "reason_for_visit", columnDefinition = "TEXT")
    private String reasonForVisit;

    @Column(name = "cancellation_reason", columnDefinition = "TEXT")
    private String cancellationReason;

    @OneToOne(mappedBy = "appointment", cascade = CascadeType.ALL, orphanRemoval = true)
    private VideoCall videoCall;

    @OneToMany(mappedBy = "appointment", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<AppointmentDocument> appointmentDocuments = new ArrayList<>();

    @OneToOne
    @JoinColumn(name = "referral_id")
    private com.mytelmed.core.referral.entity.Referral referral;

    @Column(name = "completed_at")
    private Instant completedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    /**
     * Checks if this appointment requires a video call (VIRTUAL mode)
     */
    public boolean requiresVideoCall() {
        return consultationMode == ConsultationMode.VIRTUAL;
    }

    /**
     * Checks if this appointment is conducted physically at the facility
     */
    public boolean isPhysicalConsultation() {
        return consultationMode == ConsultationMode.PHYSICAL;
    }

    /**
     * Checks if this appointment is conducted virtually online
     */
    public boolean isVirtualConsultation() {
        return consultationMode == ConsultationMode.VIRTUAL;
    }
}
