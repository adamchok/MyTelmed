package com.mytelmed.core.auth.repository;

import com.mytelmed.core.auth.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;


@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {
    Optional<RefreshToken> findByToken(UUID token);
    Optional<RefreshToken> findByAccountId(UUID accountId);
    void deleteByAccountId(UUID accountId);
}
