package com.mytelmed.model.entity;

import com.mytelmed.constant.AppointmentModeType;
import com.mytelmed.constant.AppointmentStatusType;
import com.mytelmed.model.entity.files.Document;
import com.mytelmed.utils.converters.AppointmentModeTypeConverter;
import com.mytelmed.utils.converters.AppointmentStatusTypeConverter;
import com.mytelmed.utils.converters.EncryptionConverter;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name="appointment")
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;

    @Column(name = "date_time")
    private Instant appointmentDateTime;

    @Column(name = "end_time")
    private Instant appointmentEndDateTime;

    @Column(name = "duration")
    private int duration;

    @Column(name = "status", length = 3)
    @Convert(converter = AppointmentStatusTypeConverter.class)
    private AppointmentStatusType status;

    @Column(name = "mode", length = 3)
    @Convert(converter = AppointmentModeTypeConverter.class)
    private AppointmentModeType mode;

    @ManyToOne
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @Column(name = "reason", length = 300)
    @Convert(converter = EncryptionConverter.class)
    private String reason;

    @ManyToMany
    @JoinTable(
            name = "appt_docs",
            joinColumns = @JoinColumn(name = "appointment_id"),
            inverseJoinColumns = @JoinColumn(name = "document_id")
    )
    private List<Document> documentList = new ArrayList<>();

    @Column(name = "note", length = 300)
    private String notes;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name="updated_at")
    private Instant updatedAt;

    @PrePersist
    public void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = Instant.now();
    }

    public void addDocument(Document document) {
        documentList.add(document);
    }

    public void removeDocument(Document document) {
        documentList.remove(document);
    }
}
