package com.mytelmed.core.prescription.entity;

import com.mytelmed.common.constant.prescription.PrescriptionStatus;
import com.mytelmed.core.appointment.entity.Appointment;
import com.mytelmed.core.doctor.entity.Doctor;
import com.mytelmed.core.facility.entity.Facility;
import com.mytelmed.core.patient.entity.Patient;
import com.mytelmed.core.pharmacist.entity.Pharmacist;
import com.mytelmed.core.delivery.entity.MedicationDelivery;
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
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "prescription")
public class Prescription {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "prescription_number", nullable = false, unique = true)
    private String prescriptionNumber;

    @ManyToOne(optional = false)
    @JoinColumn(name = "appointment_id", nullable = false)
    private Appointment appointment;

    @ManyToOne(optional = false)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @ManyToOne(optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(optional = false)
    @JoinColumn(name = "facility_id", nullable = false)
    private Facility facility;

    @ManyToOne
    @JoinColumn(name = "pharmacist_id")
    private Pharmacist pharmacist;

    @Column(name = "diagnosis", nullable = false, columnDefinition = "TEXT")
    private String diagnosis;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "instructions", nullable = false, columnDefinition = "TEXT")
    private String instructions;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private PrescriptionStatus status = PrescriptionStatus.CREATED;

    @OneToMany(mappedBy = "prescription", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PrescriptionItem> prescriptionItems = new ArrayList<>();

    @OneToOne(mappedBy = "prescription", cascade = CascadeType.ALL, orphanRemoval = true)
    private MedicationDelivery medicationDelivery;

    @Column(name = "expiry_date", nullable = false)
    private Instant expiryDate;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void generatePrescriptionNumber() {
        if (prescriptionNumber == null) {
            this.prescriptionNumber = "RX" + System.currentTimeMillis() +
                    facility.getId().toString().substring(0, 8).toUpperCase();
        }

        // Set standard expiry date for Malaysian public healthcare: 30 days
        if (expiryDate == null) {
            this.expiryDate = Instant.now().plus(30, ChronoUnit.DAYS);
        }
    }

    /**
     * Checks if prescription has expired
     */
    public boolean isExpired() {
        return expiryDate != null && Instant.now().isAfter(expiryDate);
    }

    /**
     * Checks if prescription is ready for processing (patient has chosen delivery
     * method)
     */
    public boolean isReadyForProcessing() {
        return status == PrescriptionStatus.READY_FOR_PROCESSING;
    }

    /**
     * Checks if prescription is completed
     */
    public boolean isCompleted() {
        return status == PrescriptionStatus.READY;
    }
}
