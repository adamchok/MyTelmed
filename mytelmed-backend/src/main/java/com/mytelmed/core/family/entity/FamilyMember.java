package com.mytelmed.core.family.entity;

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
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
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

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Convert(converter = EncryptionConverter.class)
    @Column(name = "name", nullable = false)
    private String name;

    @OneToOne
    @JoinColumn(name = "member_account_id")
    private Account memberAccount;

    @Convert(converter = EncryptionConverter.class)
    @Column(name = "relationship", nullable = false)
    private String relationship;

    @Convert(converter = EncryptionConverter.class)
    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "pending", nullable = false)
    private boolean pending;

    @Builder.Default
    @OneToMany(mappedBy = "familyMember", cascade = jakarta.persistence.CascadeType.ALL, orphanRemoval = true)
    private List<FamilyMemberPermission> permissions = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
