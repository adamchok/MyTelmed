package com.mytelmed.core.notification.entity;

import com.mytelmed.core.auth.entity.Account;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
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
@Table(name = "push_subscriptions", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"account_id", "endpoint"})
})
public class PushSubscription {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Column(name = "endpoint", nullable = false, length = 1000)
    private String endpoint;

    @Column(name = "p256dh", nullable = false, length = 500)
    private String p256dh;

    @Column(name = "auth", nullable = false, length = 500)
    private String auth;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @Column(name = "device_info", length = 500)
    private String deviceInfo;

    @Column(name = "last_used_at")
    private Instant lastUsedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
