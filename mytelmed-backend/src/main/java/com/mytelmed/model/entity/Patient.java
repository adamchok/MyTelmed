package com.mytelmed.model.entity;

import com.mytelmed.constant.GenderType;
import com.mytelmed.model.entity.files.Document;
import com.mytelmed.model.entity.security.User;
import com.mytelmed.utils.BlindIndex;
import com.mytelmed.utils.converters.EncryptionConverter;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "patient")
public class Patient {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "patient_id")
    private UUID id;

    @OneToOne(fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Convert(converter = EncryptionConverter.class)
    @Column(name = "name", nullable = false)
    private String name;

    @Convert(converter = EncryptionConverter.class)
    @Column(name = "nric", nullable = false, unique = true)
    private String nric;

    @Column(name = "nric_hash", nullable = false, unique = true, length = 64)
    private String nricHash;

    @Convert(converter = EncryptionConverter.class)
    @Column(name = "serial_num", nullable = false)
    private String serialNumber;

    @Convert(converter = EncryptionConverter.class)
    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "email_hash", nullable = false, unique = true, length = 64)
    private String emailHash;

    @Convert(converter = EncryptionConverter.class)
    @Column(name = "phone", nullable = false, unique = true)
    private String phone;
    
    @Column(name = "gender")
    private GenderType gender;
    
    @Column(name = "dob")
    private LocalDate dateOfBirth;

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Document> documents = new ArrayList<>();

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
        if (email != null)  this.emailHash  = BlindIndex.sha256(email);
        if (nric  != null)  this.nricHash   = BlindIndex.sha256(nric);
    }

    public void addDocument(Document document) {
        documents.add(document);
        document.setPatient(this);
    }

    public void removeDocument(Document document) {
        documents.remove(document);
        document.setPatient(null);
    }
}