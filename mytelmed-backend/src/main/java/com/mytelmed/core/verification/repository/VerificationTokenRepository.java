package com.mytelmed.core.verification.repository;

import com.mytelmed.core.verification.entity.VerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;
import java.util.UUID;


@Repository
public interface VerificationTokenRepository extends JpaRepository<VerificationToken, UUID> {
    Optional<VerificationToken> findByToken(String token);

    Optional<VerificationToken> findByEmail(String email);

    @Modifying
    @Transactional
    void deleteByToken(String token);
}
