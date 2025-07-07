package com.mytelmed.core.verification.repository;

import com.mytelmed.core.verification.entity.VerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;


@Repository
public interface VerificationTokenRepository extends JpaRepository<VerificationToken, UUID> {
    Optional<VerificationToken> findByToken(String token);

    void deleteByEmail(String email);

    void deleteByToken(String token);
}