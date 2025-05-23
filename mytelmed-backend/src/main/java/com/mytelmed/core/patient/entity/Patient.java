package com.mytelmed.core.patient.entity;

import com.mytelmed.common.constants.Gender;
import com.mytelmed.common.utils.conveter.EncryptionConverter;
import com.mytelmed.core.address.entity.Address;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.document.entity.Document;
import com.mytelmed.core.family.entity.FamilyMember;
import com.mytelmed.core.image.entity.Image;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;


@Getter
@Setter
@ToString(exclude = "addressList")
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "patient")
public class Patient {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(mappedBy = "patient")
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Convert(converter = EncryptionConverter.class)
    @Column(name = "name", nullable = false)
    private String name;

    @Convert(converter = EncryptionConverter.class)
    @Column(name = "nric", nullable = false, unique = true)
    private String nric;

    @Column(name = "hashed_nric", nullable = false, unique = true, length = 64)
    private String hashedNric;

    @Convert(converter = EncryptionConverter.class)
    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "hashed_email", nullable = false, unique = true, length = 64)
    private String hashedEmail;

    @Convert(converter = EncryptionConverter.class)
    @Column(name = "serial_number", nullable = false, unique = true)
    private String serialNumber;

    @Convert(converter = EncryptionConverter.class)
    @Column(name = "phone", nullable = false, unique = true)
    private String phone;

    @Column(name = "dob", nullable = false)
    private LocalDate dateOfBirth;

    @Column(name = "gender", nullable = false)
    @Enumerated(EnumType.STRING)
    private Gender gender;

    @OneToOne(mappedBy = "entity_id")
    @JoinColumn(name = "image_id")
    private Image profileImage;

    @OneToMany(mappedBy = "patient")
    private List<Address> addressList = new ArrayList<>();

    @OneToMany(mappedBy = "patient")
    private List<Document> documentList = new ArrayList<>();

    @OneToMany(mappedBy = "patient")
    private List<FamilyMember> familyMemberList = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    @PreUpdate
    protected void beforeSave() {

    }
}
