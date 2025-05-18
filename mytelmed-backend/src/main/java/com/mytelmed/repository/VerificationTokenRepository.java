package com.mytelmed.repository;

import com.mytelmed.model.entity.security.VerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;


@Repository
public interface VerificationTokenRepository extends JpaRepository<VerificationToken, UUID> {
    Optional<VerificationToken> findByEmailAndToken(String email, String token);
    Optional<VerificationToken> findByEmail(String email);
}
