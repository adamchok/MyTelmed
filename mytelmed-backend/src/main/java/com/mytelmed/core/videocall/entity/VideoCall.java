package com.mytelmed.core.videocall.entity;

import com.mytelmed.core.appointment.entity.Appointment;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
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
@Table(name = "video_call")
public class VideoCall {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(optional = false, orphanRemoval = true)
    @JoinColumn(name = "appointment_id", nullable = false, unique = true)
    private Appointment appointment;

    @Column(name = "stream_call_id")
    private String streamCallId;

    @Column(name = "stream_call_type")
    private String streamCallType;

    @Column(name = "patient_token", columnDefinition = "TEXT")
    private String patientToken;

    @Column(name = "provider_token", columnDefinition = "TEXT")
    private String providerToken;

    @Column(name = "meeting_started_at")
    private Instant meetingStartedAt;

    @Column(name = "meeting_ended_at")
    private Instant meetingEndedAt;

    @Column(name = "patient_joined_at")
    private Instant patientJoinedAt;

    @Column(name = "provider_joined_at")
    private Instant providerJoinedAt;

    @Column(name = "patient_left_at")
    private Instant patientLeftAt;

    @Column(name = "provider_left_at")
    private Instant providerLeftAt;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
