package com.mytelmed.core.video.entity;

import com.mytelmed.common.constant.file.VideoType;
import com.mytelmed.common.utils.conveter.EncryptionConverter;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
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
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "video")
public class Video {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Convert(converter = EncryptionConverter.class)
    @Column(name = "key", nullable = false, unique = true)
    private String videoKey;

    @Column(name = "type")
    @Enumerated(EnumType.STRING)
    private VideoType videoType;

    @Column(name = "entity_id")
    private UUID entityId;

    @Column(name = "duration_seconds")
    private Integer durationSeconds;

    @Column(name = "file_size")
    private Long fileSize;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
