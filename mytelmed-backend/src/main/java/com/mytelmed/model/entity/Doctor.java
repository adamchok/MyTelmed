package com.mytelmed.model.entity;

import com.mytelmed.constant.GenderType;
import com.mytelmed.constant.SpecializationType;
import com.mytelmed.model.entity.files.Image;
import com.mytelmed.model.entity.security.User;
import com.mytelmed.utils.BlindIndex;
import com.mytelmed.utils.converters.EncryptionConverter;
import com.mytelmed.utils.converters.GenderTypeConverter;
import com.mytelmed.utils.converters.SpecializationTypeConverter;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
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
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;


@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "doctor")
public class Doctor {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "doctor_id")
    private UUID id;

    @Column(name = "name", nullable = false)
    @Convert(converter = EncryptionConverter.class)
    private String name;

    @Column(name = "nric", nullable = false, unique = true)
    @Convert(converter = EncryptionConverter.class)
    private String nric;

    @Column(name = "nric_hash", nullable = false, unique = true, length = 64)
    private String nricHash;

    @Column(name = "email", nullable = false, unique = true)
    @Convert(converter = EncryptionConverter.class)
    private String email;

    @Column(name = "email_hash", nullable = false, unique = true, length = 64)
    private String emailHash;

    @Column(name = "phone", nullable = false, unique = true)
    @Convert(converter = EncryptionConverter.class)
    private String phone;

    @Column(name = "serial_num", nullable = false, unique = true)
    @Convert(converter = EncryptionConverter.class)
    private String serialNumber;

    @Column(name = "gender",nullable = false)
    @Convert(converter = GenderTypeConverter.class)
    private GenderType gender;

    @Column(name = "dob", nullable = false)
    private LocalDate dob;

    @OneToOne(fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "facility_id")
    private Facility facility;

    @Column(name="specialization", nullable = false)
    @Convert(converter = SpecializationTypeConverter.class)
    private SpecializationType specialization;

    @OneToOne
    @JoinColumn(name = "image_id")
    private Image image;

    @Column(name="description", length = 300)
    private String description;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
        computeBlindIndex();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
        computeBlindIndex();
    }

    private void computeBlindIndex() {
        this.emailHash  = BlindIndex.sha256(email);
        this.nricHash   = BlindIndex.sha256(nric);
    }
}
