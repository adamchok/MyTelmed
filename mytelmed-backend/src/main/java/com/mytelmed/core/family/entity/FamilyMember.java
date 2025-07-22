package com.mytelmed.core.family.entity;

import com.mytelmed.common.utils.HashUtil;
import com.mytelmed.common.utils.conveter.EncryptionConverter;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.patient.entity.Patient;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "family_member")
public class FamilyMember {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Convert(converter = EncryptionConverter.class)
    @Column(name = "name", nullable = false)
    private String name;

    @Convert(converter = EncryptionConverter.class)
    @Column(name = "nric", nullable = false)
    private String nric;

    @Column(name = "hashed_nric", nullable = false, length = 64)
    private String hashedNric;

    @ManyToOne
    @JoinColumn(name = "member_account_id")
    private Account memberAccount;

    @Convert(converter = EncryptionConverter.class)
    @Column(name = "relationship", nullable = false)
    private String relationship;

    @Convert(converter = EncryptionConverter.class)
    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "pending", nullable = false)
    private boolean pending;

    @Builder.Default
    @Column(name = "can_view_medical_records", nullable = false)
    private boolean canViewMedicalRecords = false;

    @Builder.Default
    @Column(name = "can_view_appointments", nullable = false)
    private boolean canViewAppointments = false;

    @Builder.Default
    @Column(name = "can_manage_appointments", nullable = false)
    private boolean canManageAppointments = false;

    @Builder.Default
    @Column(name = "can_view_prescriptions", nullable = false)
    private boolean canViewPrescriptions = false;

    @Builder.Default
    @Column(name = "can_manage_prescriptions", nullable = false)
    private boolean canManagePrescriptions = false;

    @Builder.Default
    @Column(name = "can_view_billing", nullable = false)
    private boolean canViewBilling = false;

    @Builder.Default
    @Column(name = "can_manage_billing", nullable = false)
    private boolean canManageBilling = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    @PreUpdate
    protected void beforeSave() {
        if (nric != null)
            hashedNric = HashUtil.sha256(nric);
    }
}
