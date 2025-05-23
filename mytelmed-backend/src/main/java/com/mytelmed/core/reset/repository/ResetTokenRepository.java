package com.mytelmed.core.reset.repository;

import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.reset.entity.ResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;


@Repository
public interface ResetTokenRepository extends JpaRepository<ResetToken, UUID> {
    Optional<ResetToken> findByToken(String token);

    void deleteByAccount(Account account);
}