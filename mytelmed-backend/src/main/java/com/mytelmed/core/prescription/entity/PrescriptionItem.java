package com.mytelmed.core.prescription.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.Instant;
import java.util.UUID;


@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "prescription_item")
public class PrescriptionItem {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "prescription_id", nullable = false)
    private Prescription prescription;

    @Column(name = "medication_name", nullable = false)
    private String medicationName;

    @Column(name = "generic_name")
    private String genericName;

    @Column(name = "dosage_form", nullable = false)
    private String dosageForm;

    @Column(name = "strength", nullable = false)
    private String strength;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "instructions", nullable = false, columnDefinition = "TEXT")
    private String instructions;

    @Column(name = "frequency", nullable = false)
    private String frequency;

    @Column(name = "duration", nullable = false)
    private String duration;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
