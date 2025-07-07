package com.mytelmed.core.referral.entity;

import com.mytelmed.common.constant.referral.ReferralPriority;
import com.mytelmed.common.constant.referral.ReferralStatus;
import com.mytelmed.common.constant.referral.ReferralType;
import com.mytelmed.core.appointment.entity.Appointment;
import com.mytelmed.core.doctor.entity.Doctor;
import com.mytelmed.core.patient.entity.Patient;
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
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;


@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "referral")
public class Referral {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "referral_number", nullable = false, unique = true)
    private String referralNumber;

    @ManyToOne(optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(optional = false)
    @JoinColumn(name = "referring_doctor_id", nullable = false)
    private Doctor referringDoctor;

    @ManyToOne
    @JoinColumn(name = "referred_doctor_id")
    private Doctor referredDoctor;

    @Enumerated(EnumType.STRING)
    @Column(name = "referral_type", nullable = false)
    private ReferralType referralType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private ReferralStatus status = ReferralStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false)
    @Builder.Default
    private ReferralPriority priority = ReferralPriority.ROUTINE;

    @Column(name = "clinical_summary", nullable = false, columnDefinition = "TEXT")
    private String clinicalSummary;

    @Column(name = "reason_for_referral", nullable = false, columnDefinition = "TEXT")
    private String reasonForReferral;

    @Column(name = "investigations_done", columnDefinition = "TEXT")
    private String investigationsDone;

    @Column(name = "current_medications", columnDefinition = "TEXT")
    private String currentMedications;

    @Column(name = "allergies", columnDefinition = "TEXT")
    private String allergies;

    @Column(name = "vital_signs", columnDefinition = "TEXT")
    private String vitalSigns;

    // External doctor details (for external referrals)
    @Column(name = "external_doctor_name")
    private String externalDoctorName;

    @Column(name = "external_doctor_speciality")
    private String externalDoctorSpeciality;

    @Column(name = "external_facility_name")
    private String externalFacilityName;

    @Column(name = "external_facility_address", columnDefinition = "TEXT")
    private String externalFacilityAddress;

    @Column(name = "external_contact_number")
    private String externalContactNumber;

    @Column(name = "external_email")
    private String externalEmail;

    // Appointment details (for internal referrals)
    @OneToOne(mappedBy = "referral", cascade = CascadeType.ALL, orphanRemoval = true)
    private Appointment scheduledAppointment;

    @Column(name = "expiry_date", nullable = false)
    private LocalDate expiryDate;

    @Column(name = "accepted_at")
    private Instant acceptedAt;

    @Column(name = "rejected_at")
    private Instant rejectedAt;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void generateReferralNumber() {
        if (referralNumber == null) {
            this.referralNumber = "REF" + System.currentTimeMillis() +
                    patient.getId().toString().substring(0, 8).toUpperCase();
        }
    }
}
