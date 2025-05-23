package com.mytelmed.core.document.entity;


import com.mytelmed.common.constants.DocumentType;
import com.mytelmed.common.utils.conveter.EncryptionConverter;
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
@Table(name = "document")
public class Document {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Convert(converter = EncryptionConverter.class)
    @Column(name = "name", nullable = false)
    private String documentName;

    @Convert(converter = EncryptionConverter.class)
    @Column(name = "type", nullable = false)
    private DocumentType documentType;

    @Convert(converter = EncryptionConverter.class)
    @Column(name = "key", nullable = false, unique = true)
    private String documentKey;

    @Convert(converter = EncryptionConverter.class)
    @Column(name = "size", nullable = false)
    private String documentSize;

    @OneToMany(mappedBy = "document")
    private List<DocumentAccess> documentAccessList = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    private String documentUrl;
}
