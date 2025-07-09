package com.mytelmed.core.doctor.entity;

import com.mytelmed.common.constant.Gender;
import com.mytelmed.common.constant.Language;
import com.mytelmed.common.utils.HashUtil;
import com.mytelmed.common.utils.conveter.EncryptionConverter;
import com.mytelmed.common.utils.conveter.LanguageListConverter;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.facility.entity.Facility;
import com.mytelmed.core.image.entity.Image;
import jakarta.persistence.CascadeType;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.ElementCollection;
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
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "doctor")
public class Doctor {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(optional = false, cascade = CascadeType.ALL, orphanRemoval = true)
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
    @Column(name = "phone", nullable = false, unique = true)
    private String phone;

    @Column(name = "dob", nullable = false)
    private LocalDate dateOfBirth;

    @Convert(converter = EncryptionConverter.class)
    @Column(name = "gender", nullable = false)
    @Enumerated(EnumType.STRING)
    private Gender gender;

    @ManyToOne(optional = false)
    @JoinColumn(name = "facility_id", nullable = false)
    private Facility facility;

    @ElementCollection
    @CollectionTable(
            name = "doctor_specialities",
            joinColumns = @JoinColumn(name = "doctor_id")
    )
    @Column(name = "speciality_name")
    private List<String> specialityList;

    @Convert(converter = LanguageListConverter.class)
    @Column(name = "languages", nullable = false)
    private List<Language> languageList;

    @Convert(converter = EncryptionConverter.class)
    @Column(name = "qualifications", nullable = false, columnDefinition = "TEXT")
    private String qualifications;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "image_id")
    private Image profileImage;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    @PreUpdate
    protected void beforeSave() {
        if (email != null) hashedEmail = HashUtil.sha256(email);
        if (nric != null) hashedNric = HashUtil.sha256(nric);
    }
}
