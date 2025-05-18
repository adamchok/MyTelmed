package com.mytelmed.repository;

import com.mytelmed.model.entity.security.ResetToken;
import com.mytelmed.model.entity.security.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ResetTokenRepository extends JpaRepository<ResetToken, UUID> {
    Optional<ResetToken> findByToken(String token);
    void deleteByUser(User user);
}